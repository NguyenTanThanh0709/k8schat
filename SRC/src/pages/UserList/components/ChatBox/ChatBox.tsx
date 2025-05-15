import { useEffect, useRef, useState } from "react";
import moment from "moment";
import InputEmoji from "react-input-emoji";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useMessages } from 'src/contexts/MessagesContext';
import { GetMessagesQuery, IMessage } from 'src/types/utils.type';
import messagesApi from 'src/apis/messages.api';
import { User } from 'src/types/user.type';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from "uuid";
import { storage } from 'src/configs/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {  getSocket, connectSocket  } from "src/socket/socket";
import { Socket } from "socket.io-client";
import { Toast } from "react-bootstrap";

interface AsideFilterMessageProps {
  selectedCategory: string
}

export default function ChatBox({ selectedCategory }: AsideFilterMessageProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File>();
  const [textMessage, setTextMessage] = useState<string>("");
  const [allMessages, setAllMessages] = useState<IMessage[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
    const { data: profileDataLS } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const raw = localStorage.getItem('profile');
      if (!raw) throw new Error('No profile found in localStorage');
      return JSON.parse(raw) as User;
    },
  });
    const PhoneSender = profileDataLS?.phone || '';
    const socketRef = useRef<Socket>();

    useEffect(() => {
      if (PhoneSender && !socketRef.current) {
        connectSocket(PhoneSender);
        socketRef.current = getSocket();
      }
    }, [PhoneSender]);

  const scroll = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const { messagesData, userData, groupResponse } = useMessages();





  // Fetch messages on mount
  useEffect(() => {
    if (!messagesData) return;
    fetchMessages().then((newMessages) => {
      setAllMessages(newMessages);
      setTimeout(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
  }, [messagesData]);

  const fetchMessages = async (lastTimestamp?: string) => {
    if (!messagesData) return [];
    const query: GetMessagesQuery = {
      ...messagesData,
      limit: 5,
      lastMessageTimestamp: lastTimestamp,
    };
    const response = await messagesApi.getMessage(query);
    return response.data;
  };

  // Load more on scroll top
  useEffect(() => {
    const handleScroll = async () => {
      const container = chatBodyRef.current;
      if (!container || container.scrollTop !== 0 || allMessages.length === 0) return;

      setLoadingMore(true);
      const firstMsg = allMessages[0];
      const moreMessages = await fetchMessages(firstMsg.timestamp?.toISOString() as string);

      if (moreMessages.length > 0) {
        const scrollHeightBefore = container.scrollHeight;
        setAllMessages((prev) => [...moreMessages, ...prev]);
        setTimeout(() => {
          const scrollHeightAfter = container.scrollHeight;
          container.scrollTop = scrollHeightAfter - scrollHeightBefore;
        }, 200);
      }

      setLoadingMore(false);
    };

    const container = chatBodyRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [allMessages]);

  const mutationSendMessage = useMutation({
    mutationFn: (newMsg: IMessage) => messagesApi.sendMessage(newMsg),
    onSuccess: (data) => {
      setAllMessages((prev) => [...prev, data.data]);
      toast.success("Gửi thành công");
      scroll.current?.scrollIntoView({ behavior: "smooth" });
    },
    onError: () => {
      toast.error("Gửi thất bại");
    }
  });

  const sendTextMessage = (message: string, clearInput: (msg: string) => void) => {
    if (!message.trim()) return;
    const newMsg: IMessage = {
      text: message,
      sender: PhoneSender,
      receiver: userData?.phone || '',
      is_group: selectedCategory !== '1',
      content_type: 'text'
    };
    socketRef.current?.emit("sendMessage", newMsg);
    setAllMessages(prev => [...prev, newMsg]);

    // Hiển thị ngay lên UI
    // setMessages((prev) => [...prev, newMsg]);
    // setMessage("");
    // mutationSendMessage.mutate(newMsg);
    clearInput("");
  };

  useEffect(() => {

  const socket = socketRef.current;
  if (!socket) return;
  console.log("ttt")

  const handleReceive = (msg: IMessage) => {
    console.log("📥 Tin nhắn đến:", msg);
    toast.success(`📩 Có tin nhắn đến từ SĐT: ${msg.sender}`);
    setAllMessages(prev => [...prev, msg]);
  };

  socket.on("receiveMessage", handleReceive);
  return () => {
    socket.off("receiveMessage", handleReceive);
  };
  }, [socketRef.current]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const interval = setInterval(() => {
      socket.emit("heartbeat");
      console.log("💓 heartbeat sent");
    }, 25000); // Gửi 25s để trước khi EX:60 hết hạn

    return () => clearInterval(interval); // cleanup khi component unmount
  }, []);


  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") === 0) {
          const file = item.getAsFile();
          if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setFile(file);
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleSendPastedImage = async () => {
    if (!previewImage || !file) return;

    try {
      const uniqueId = uuidv4();
      const storageRef = ref(storage, `images/${uniqueId}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const newMsg: IMessage = {
        sender: PhoneSender,
        receiver: userData?.phone || '',
        is_group: selectedCategory !== '1',
        content_type: 'image',
        url_file: downloadURL,
        name_file: file.name,
        size_file: file.size.toString(),
        mime_type_file: file.type,
        duration_video: "0"
      };

      mutationSendMessage.mutate(newMsg);
      setPreviewImage(null);
      setFile(undefined);
    } catch (error) {
      toast.error("Gửi ảnh thất bại");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const uniqueId = uuidv4();
      const storageRef = ref(storage, `files/${uniqueId}_${selectedFile.name}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const newMsg: IMessage = {
        sender: PhoneSender,
        receiver: userData?.phone || '',
        is_group: selectedCategory !== '1',
        content_type: selectedFile.type.startsWith("video") ? 'video' : 'file',
        url_file: downloadURL,
        name_file: selectedFile.name,
        size_file: selectedFile.size.toString(),
        mime_type_file: selectedFile.type,
        duration_video: "0",
      };

      mutationSendMessage.mutate(newMsg);
    } catch (error) {
      toast.error('Upload file thất bại');
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[90vh] flex flex-col border rounded-xl shadow-md overflow-hidden bg-white">
      <div className="flex justify-between items-center p-4 bg-green-50 border-b font-semibold text-gray-800">
        <span>💬 {groupResponse ? `Nhóm: ${groupResponse.group_name}` : `Bạn: ${userData?.name}`}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => alert("Đang gọi thoại...")} title="Gọi thoại" className="hover:bg-green-100 p-2 rounded-full">📞</button>
          <button onClick={() => alert("Đang gọi video...")} title="Gọi video" className="hover:bg-green-100 p-2 rounded-full">🎥</button>
          <button title="Xoá tất cả tin nhắn" className="hover:bg-red-100 p-2 rounded-full">🗑️</button>
        </div>
      </div>

      <div ref={chatBodyRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
        {loadingMore && <div className="text-center text-sm text-gray-400">Đang tải thêm...</div>}
        {allMessages.map((message, index) => (
          <div
            key={index}
            ref={index === allMessages.length - 1 ? scroll : null}
            className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${message.sender === PhoneSender ? "ml-auto bg-green-500 text-white" : "mr-auto bg-white border"}`}
          >
            {message.content_type === 'image' && message.url_file && (
              <img src={message.url_file} alt={message.name_file || "Image"} className="rounded-lg max-w-full w-full max-h-[300px] object-contain mb-2" />
            )}
            {message.content_type === 'video' && message.url_file && (
              <video controls className="rounded-lg w-full max-w-xs max-h-[300px] object-contain mb-2" src={message.url_file} />
            )}
            {message.content_type === 'file' && message.url_file && (
              <a href={message.url_file} target="_blank" rel="noopener noreferrer" className="underline text-sm block mb-1">📎 {message.name_file}</a>
            )}
            <span>{message.text}</span>
            <div className="text-[10px] text-right text-gray-300 mt-1">
              {moment(message.timestamp).calendar(undefined, {
                lastDay: "[Hôm qua] HH:mm",
                lastWeek: "dddd HH:mm",
                sameElse: "DD/MM/YYYY HH:mm:ss",
              })}
            </div>
          </div>
        ))}
      </div>

      {previewImage && (
        <div className="p-2 border-t bg-gray-100 flex items-center space-x-4">
          <img src={previewImage} alt="Pasted" className="w-24 h-24 object-contain rounded" />
          <button onClick={handleSendPastedImage} className="text-white bg-green-500 px-3 py-1 rounded hover:bg-green-600">Gửi ảnh</button>
          <button onClick={() => setPreviewImage(null)} className="text-red-500">Huỷ</button>
        </div>
      )}

      <div className="p-4 flex items-center gap-3 border-t bg-white">
      <InputEmoji
              value={textMessage}
              onChange={setTextMessage}
              fontFamily="Oswald"
              borderColor="rgba(10, 200, 10, 0.5)"
              placeholder="Nhập tin nhắn..."
              shouldReturn={true}
              shouldConvertEmojiToImage={false}
              onEnter={() =>
                sendTextMessage(textMessage, setTextMessage)
              }
            />
        <input type="file" onChange={handleFileChange} className="hidden" id="fileInput" />
        <label htmlFor="fileInput" title="Gửi file" className="cursor-pointer">📎</label>
        
      <button
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
      onClick={() =>
        sendTextMessage(textMessage, setTextMessage)
      }
    >
      Gửi
    </button>
      </div>
    </div>
  );
}
