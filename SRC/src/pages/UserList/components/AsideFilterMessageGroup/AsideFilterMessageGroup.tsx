import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import clsx from 'clsx'
import { useMutation } from '@tanstack/react-query'
import friendApi from 'src/apis/friend.api'
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
import { useQuery ,useQueryClient  } from '@tanstack/react-query'
import { User, FriendListResponse, GroupReponse } from 'src/types/user.type'
import GroupApi from 'src/apis/group.api'
import { FriendTListConfig } from 'src/types/product.type'
import Popover from 'src/components/Popover'
import { useMessages } from 'src/contexts/MessagesContext'
import { GetMessagesQuery } from 'src/types/utils.type'


interface AsideFilterMessageProps {
  selectedCategory: string
}

interface CreateGroupBody {
  ownerPhone: string
  name: string
}


export default function AsideFilterMessageGroup({ selectedCategory }: AsideFilterMessageProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const { setMessagesData, setUserData, setGroupResponse } = useMessages();

  const [searchName, setSearchName] = useState('')
  const queryConfig: FriendTListConfig = {
    name: searchName
  }

  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { data: profileDataLS, refetch } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const raw = localStorage.getItem('profile');
      if (!raw) throw new Error('No profile found in localStorage');
      return JSON.parse(raw) as User;
    },
  });


  const phone = profileDataLS?.phone

  const { data: groupList } = useQuery({
    queryKey: ['groupList', phone, queryConfig],
    queryFn: () => GroupApi.getGroupList(queryConfig, phone as string),
    enabled: selectedCategory === '2' && !!phone,
  })

  const queryClient = useQueryClient()
  const createGroupMutation = useMutation((body: CreateGroupBody) =>
    GroupApi.createGroup(body)
  )
  const handleCreateGroup = () => {
    if (!groupName.trim()) return
  
    createGroupMutation.mutate(
      { ownerPhone: profileDataLS?.phone as string, name: groupName },
      {
        onSuccess: () => {
      // Dùng queryClient để refetch lại groupList
      queryClient.invalidateQueries(['groupList', profileDataLS?.phone])  // Invalidate queryKey của groupList
      toast.success('Đã tạo nhóm thành công!');

      setGroupName('') // Reset lại tên group
        },
        onError: (error) => {
          console.error('Tạo group thất bại:', error)
        }
      }
    )
  }

  const [selectedFriendsToAdd, setSelectedFriendsToAdd] = useState<string[]>([])
  const handleToggleFriend = (phone: string) => {
    setSelectedFriendsToAdd((prevSelected) =>
      prevSelected.includes(phone)
        ? prevSelected.filter((p) => p !== phone)
        : [...prevSelected, phone]
    )
  }
  const { t } = useTranslation('home')


  const [selectedFeature, setselectedFeature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenAddPeople, setIsModalOpenAddPeople] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);


  const { data: groupMembers, isLoading, isError } = useQuery(
    ['groupMembers', selectedGroupId],
    () => GroupApi.getGroupMemberInfo(selectedGroupId as string),
    {
      enabled: !!selectedGroupId && selectedFeature === 'members', // Chỉ gọi API khi có groupId được chọn
    }
  );

  const queryConfigFriend: FriendTListConfig = {
    name: searchName
  }
  
  const { data: friendList } = useQuery({
    queryKey: ['friendList', phone, queryConfigFriend],
    queryFn: () => friendApi.getFriendList(queryConfigFriend, phone as string),
    enabled: !!selectedGroupId && selectedFeature === 'addPeople' && !!phone, // Chỉ gọi API khi có groupId được chọn
  })

  const handleShowAddMembers = (groupId: string) => {
    setSelectedGroupId(groupId);
    setselectedFeature('addPeople');
    setIsModalOpenAddPeople(true);
  };
  const handleCloseModalAddMembers = () => {
    setIsModalOpenAddPeople(false);
    setSelectedGroupId(null);
    setselectedFeature(null);
  };


  const handleShowMembers = (groupId: string) => {
    setSelectedGroupId(groupId);
    setselectedFeature('members');
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroupId(null);
    setselectedFeature(null);
  };

  const handleClick = (group: GroupReponse) => {
    setSelectedFriendId(group.group_id as string || null)
    const data: GetMessagesQuery = {
      sender: phone as string,
      receiver: group.group_id as string,
      is_group: true,
    };
    setMessagesData(data); // Sử dụng context để lưu dữ liệu
    setUserData(null)
    setGroupResponse(group)
  };


  const handleAddPeopleToGroup = async () => {
    if (!selectedGroupId || selectedFriendsToAdd.length === 0) return
  
    try {
      await GroupApi.addMembersToGroup(selectedGroupId, { memberPhones: selectedFriendsToAdd })
      queryClient.invalidateQueries(['groupMembers', selectedGroupId]) // Optional: refetch member list
      setSelectedFriendsToAdd([])
      handleCloseModalAddMembers()
      toast.success('Đã thêm thành viên thành công!');
    } catch (err) {
      console.error('Lỗi khi thêm thành viên:', err)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    if (!profileDataLS?.phone) return; // Ensure the user has a phone number
  
    try {
      // Call the API to remove the member from the group
      const response = await GroupApi.removeMembersFromGroup(groupId, profileDataLS.phone);
  
      // Optionally, invalidate queries to refresh the group list
      queryClient.invalidateQueries(['groupList', profileDataLS?.phone]);
      
      // Reset selected group and close the modal
      setSelectedGroupId(null);
      setIsModalOpen(false);

      if (response.data == 'Failed') {
        toast.warning('Bạn là chủ nhóm nên không thể rời!');
      } else {
        toast.success('Đã rời nhóm thành công!');
      }
  
      // Optionally, display success message
      console.log('Successfully left the group');
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };
  



  const latestMessage = {
    text: 'Hey! How are you?',
    createdAt: new Date()
  }

  const thisUserNotifications = [
    { senderId: '12345', text: 'New message from John', read: false, createdAt: new Date() }
  ]

  const isOnline = true

  const truncateText = (text: string): string => {
    let shortText = text.substring(0, 20)
    if (text.length > 20) {
      shortText += '...'
    }
    return shortText
  }

  return (
<div className='fixed left-[16rem] top-[8rem] z-20 h-[calc(100vh-8rem)] w-[400px] overflow-y-auto rounded-sm border-2 bg-white p-4 shadow-md'>
      <Link to={path.home} className='flex items-center font-bold'>
        <TfiMenuAlt className='mr-3 h-4 w-3 fill-current' />
        {t('aside filter.filter friend group')}
      </Link>
      <div className='mt-4 mb-2 h-[1px] bg-gray-300' />

      <div className='flex items-center justify-between'>
      <input
        type="text"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        placeholder="Tìm kiếm Nhóm ..."
        className="mb-4 w-full p-3 border rounded-md bg-gray-100 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 transition-all ease-in-out duration-200"
        style={{
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      />
      <Popover
              as={'span'}
              className='relative flex cursor-pointer items-center py-1 hover:text-red-300 text-orange'
              renderPopover={
                <div className='relative rounded-sm border border-gray-200 bg-white shadow-md p-4'>
                      <h3 className='text-base font-semibold mb-2'>Tạo Group mới</h3>
                      <input
                        type='text'
                        className='w-full rounded border px-3 py-2 text-sm outline-none ring-orange focus:ring-1'
                        placeholder='Nhập tên Group'
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                      <button
                        onClick={handleCreateGroup}
                        className='mt-3 w-full rounded bg-orange px-4 py-2 text-white hover:bg-orange/90 disabled:opacity-70'
                        disabled={loading}
                      >
                        {loading ? 'Đang tạo...' : 'Tạo Group'}
                      </button>
                    </div>
              }
            >
              <div className='text-2xl m-2 mb-6'>➕</div>

            </Popover>
      </div>

      <ul className='pl-2'>
  {groupList?.data.data.map((group) => {
    const isActive = group.group_id === selectedFriendId
    return (
      <li key={group.group_id} className='py-2 relative'>
        <button
        onClick={() => handleClick(group)}
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
            <div className='flex items-center space-x-3 p-5'>
                            {/* Settings Popover */}
              <div className='absolute top-2 right-2'>
              <Popover
                          as='span'
                          className='absolute top-0 right-0'
                          renderPopover={
                            <div className='w-48 rounded-sm border m border-gray-200 bg-white shadow-md p-2 space-y-2'>
                              <button className='w-full px-3 py-1 text-left text-sm hover:bg-gray-100 rounded'
                              onClick={() => handleShowMembers(group.group_id)}
                              >
                                👥 Members
                              </button>
                              <button className='w-full px-3 py-1 text-left text-sm hover:bg-gray-100 rounded'
                              onClick={() => handleShowAddMembers(group.group_id)}
                              >
                                ➕ Add People
                              </button>
                              <button className='w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-gray-100 rounded'
                              onClick={() => handleLeaveGroup(group.group_id)}
                              >
                                🚪 Leave Group
                              </button>
                            </div>
                          }
                        >
                          <div className='text-xl cursor-pointer text-gray-500 hover:text-gray-700'>⚙️</div>
              </Popover>
              </div>
              <div className='relative'>
                
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv3M0Sh0_j1xRyDkQLmq_bxgY0cwK9mchj5A&s"
                  alt='user-avatar'
                  className='h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm'
                />
                {isOnline && (
                  <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500'></span>
                )}
              </div>
              <div>
                <div className='font-semibold text-sm text-gray-900'>{group.group_name}</div>
                <div className='text-xs text-gray-500'>{truncateText(latestMessage.text)}</div>
              </div>
            </div>

            <div className='flex flex-col items-end space-y-1 relative'>
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

{/* Modal */}
{isModalOpen && groupMembers && (
        <div className='fixed inset-0 z-30 flex justify-center items-center bg-black bg-opacity-50'>
          <div className='bg-white p-4 rounded-md w-80'>
            <div className='flex justify-between'>
              <h3 className='text-lg font-semibold'>Group Members</h3>
              <button onClick={handleCloseModal} className='text-gray-500'>❌</button>
            </div>
            {isLoading ? (
              <div>Loading...</div>
            ) : isError ? (
              <div>Error fetching members</div>
            ) : (
              <ul>
                {groupMembers?.data.map((member) => (
                  <li
                  key={member.user_phone}
                  className='flex items-center p-3 space-x-4 rounded-lg hover:bg-gray-100 transition-all duration-200'
                >
                  <img
                    src={member.avatar || 'https://via.placeholder.com/40'}
                    alt='avatar'
                    className='w-12 h-12 rounded-full border-2 border-gray-200 object-cover'
                  />
                  <div className='flex-1'>
                    <div className='font-semibold text-lg text-gray-900'>{member.name}</div>
                    <div className='text-sm text-gray-500'>{member.role}</div>
                    <div className='text-xs text-gray-400 mt-1'>{`Joined: ${moment(member.joined_at).format('DD/MM/YYYY')}`}</div>
                  </div>
                </li>


                ))}
              </ul>
            )}
          </div>
        </div>
      )}



{isModalOpenAddPeople && friendList && (
  <div className='fixed inset-0 z-30 flex justify-center items-center bg-black bg-opacity-50'>
    <div className='bg-white p-4 rounded-md w-96 max-h-[80vh] overflow-y-auto'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-semibold'>Thêm thành viên</h3>
        <button onClick={handleCloseModalAddMembers} className='text-gray-500'>❌</button>
      </div>
      <ul>
        {friendList?.data.friends.map((friend) => (
          <li key={friend.phone} className='flex items-center p-2 hover:bg-gray-100 rounded-lg transition'>
            <img
              src={friend.avatar || 'https://via.placeholder.com/40'}
              alt='avatar'
              className='w-10 h-10 rounded-full mr-3'
            />
            <div className='flex-1'>
              <div className='font-medium text-gray-900'>{friend.name}</div>
              <div className='text-sm text-gray-500'>{friend.phone}</div>
            </div>
            <input
              type='checkbox'
              checked={selectedFriendsToAdd.includes(friend.phone as string)}
              onChange={() => handleToggleFriend(friend.phone as string)}
              className='form-checkbox h-5 w-5 text-orange-500'
            />
          </li>
        ))}
      </ul>
      <button
        onClick={handleAddPeopleToGroup}
        disabled={selectedFriendsToAdd.length === 0}
        className='mt-4 w-full bg-orange text-white py-2 rounded hover:bg-orange/90 disabled:opacity-60'
      >
        ➕ Thêm {selectedFriendsToAdd.length} thành viên
      </button>
    </div>
  </div>
)}



    </div>
  )
}
