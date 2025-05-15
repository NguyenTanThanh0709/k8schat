import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import moment from 'moment'
import { TfiMenuAlt } from 'react-icons/tfi'
import { createSearchParams, Link } from 'react-router-dom'
import path from 'src/constants/path'
import { Category } from 'src/types/category.type'
import { AuthSchema } from 'src/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { NoUndefinedField } from 'src/types/utils.type'
import { QueryConfig } from 'src/hooks/useQueryConfig'
import { useTranslation } from 'react-i18next'
import { useQuery  } from '@tanstack/react-query'
import { User, FriendListResponse } from 'src/types/user.type'
import friendApi from 'src/apis/friend.api'
import { FriendTListConfig } from 'src/types/product.type'
import { useMessages } from 'src/contexts/MessagesContext'
import { GetMessagesQuery } from 'src/types/utils.type'
import { connectSocket, disconnectSocket, getSocket  } from "src/socket/socket";




interface AsideFilterMessageProps {
  selectedCategory: string
}


export default function AsideFilter({ selectedCategory }: AsideFilterMessageProps) {
  const { t } = useTranslation('home')
  const { setMessagesData, setUserData, setGroupResponse } = useMessages();
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [searchName, setSearchName] = useState('')
  const queryConfig: FriendTListConfig = {
    name: searchName
  }
  
  const { data: profileDataLS, refetch } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const raw = localStorage.getItem('profile');
      if (!raw) throw new Error('No profile found in localStorage');
      return JSON.parse(raw) as User;
    },
  });


  const phone = profileDataLS?.phone

  const { data: friendList } = useQuery({
    queryKey: ['friendList', phone, queryConfig],
    queryFn: () => friendApi.getFriendList(queryConfig, phone as string),
    enabled: selectedCategory === '1' && !!phone
  })

  

  const latestMessage = {
    text: 'Hey! How are you?',
    createdAt: new Date()
  }

  const thisUserNotifications = [
    { senderId: '12345', text: 'New message from John', read: false, createdAt: new Date() }
  ]


  const truncateText = (text: string): string => {
    let shortText = text.substring(0, 20)
    if (text.length > 20) {
      shortText += '...'
    }
    return shortText
  }


  const handleClick = (phoneReceiver: User) => {
    setSelectedFriendId(phoneReceiver.phone as string || null)
    const data: GetMessagesQuery = {
      sender: phone as string,
      receiver: phoneReceiver.phone as string,
      is_group: false,
    };
    setMessagesData(data); // Sử dụng context để lưu dữ liệu
    setUserData(phoneReceiver)
    setGroupResponse(null)
  };

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    connectSocket(phone as string);

    const socket = getSocket();
  
    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };
  
    socket.off("getOnlineUsers", handleOnlineUsers); // Clear old listener
    socket.on("getOnlineUsers", handleOnlineUsers);
  
    // return () => {
    //   socket.off("getOnlineUsers", handleOnlineUsers);
    //   disconnectSocket(); // clean up when component unmounts
    // };
  }, []);
  
  const isUserOnline = (phone: string, onlineUsers: string[]): boolean => {
    return onlineUsers.includes(phone);
  };
  
  return (
<div className='fixed left-[16rem] top-[8rem] z-20 h-[calc(100vh-8rem)] w-[400px] overflow-y-auto rounded-sm border-2 bg-white p-4 shadow-md'>
      <Link to={path.home} className='flex items-center font-bold'>
        <TfiMenuAlt className='mr-3 h-4 w-3 fill-current' />
        {t('aside filter.filter friend group')}
      </Link>
      <div className='mt-4 mb-2 h-[1px] bg-gray-300' />

      <input
  type="text"
  value={searchName}
  onChange={(e) => setSearchName(e.target.value)}
  placeholder="Tìm kiếm bạn bè..."
  className="mb-4 w-full p-3 border rounded-md bg-gray-100 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 transition-all ease-in-out duration-200"
  style={{
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  }}
/>



      <ul className='pl-2'>
        {friendList?.data.friends.map((friend) => {
          const isActive = friend.phone === selectedFriendId
          return (
            <li key={friend.phone} className='py-2 relative'>
              <button
                onClick={() => handleClick(friend)}
                className='w-full text-left'
              >
                {isActive && (
                  <svg
                    viewBox='0 0 4 7'
                    className='absolute left-[-10px] top-2 mr-2 h-2 w-2 fill-orange'
                  >
                    <polygon points='4 3.5 0 0 0 7' />
                  </svg>
                )}

                {/* User Message Card */}
                <div
                  className={clsx(
                    'flex items-center justify-between rounded-lg p-3 hover:bg-gray-100 transition-all duration-150',
                    isActive && 'bg-orange-100'
                  )}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='relative'>
                      <img
                        src={friend.avatar}
                        alt='user-avatar'
                        className='h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm'
                      />
<span
  className={clsx(
    'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white',
    isUserOnline(friend.phone as string, onlineUsers) ? 'bg-green-500' : 'bg-gray-400'
  )}
></span>

                    </div>
                    <div>
                      <div className='font-semibold text-sm text-gray-900'>{friend.name}</div>
                      <div className='text-xs text-gray-500'>{truncateText(latestMessage.text)}</div>
                    </div>
                  </div>

                  <div className='flex flex-col items-end space-y-1'>
                    <div className='text-xs text-gray-400'>
                      {moment(latestMessage.createdAt).format('HH:mm DD/MM')}
                    </div>
                    {thisUserNotifications.length > 0 && (
                      <div className='bg-red-500 text-white text-xs px-2 py-0.5 rounded-full'>
                        {thisUserNotifications.length}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
