import { AiOutlineBell } from 'react-icons/ai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import authApi from 'src/apis/auth.api'
// import purchaseApi from 'src/apis/purchase.api'
import noproduct from 'src/assets/images/no-product.png'
import path from 'src/constants/path'
import { purchasesStatus } from 'src/constants/purchase'
import { AppContext } from 'src/contexts/app.context'
import useSearchProduct from 'src/hooks/useSearchProduct'
import { formatCurrency, getAvatarUrl } from 'src/utils/utils'
import Popover from '../Popover'
import { locales } from 'src/i18n/i18n'
import { useTranslation } from 'react-i18next'
import notificationApi from 'src/apis/notification.api'
import { Notification } from 'src/types/utils.type'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import friendApi from 'src/apis/friend.api'
import { FriendRequest } from 'src/types/user.type'
import { getSocket } from 'src/socket/socket'

const MAX_PURCHASES = 5
export default function Header() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const currentLanguage = locales[i18n.language as keyof typeof locales]
  const { setIsAuthenticated, isAuthenticated, setProfile, profile } = useContext(AppContext)
  const { register, onSubmitSearch } = useSearchProduct()
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5


  // console.log(profile)

  const { data: notifications, isLoading, error,   } = useQuery({
    queryKey: ['notifications', profile?.phone, currentPage],
    queryFn: () => notificationApi.getNotifications(profile?.phone || '', { page: currentPage, limit: itemsPerPage }).then(res => res.data),
    enabled: !!profile?.phone
  })

  console.log(notifications)
  const logoutMutation = useMutation(authApi.logoutAccount)
  // handle logout mutate
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setIsAuthenticated(false)
        setProfile(null)
        toast.success('Logout success')
        const socket = getSocket();
        socket.disconnect();
        // case : when logout then remove all queries. if not, although logout but still have data in cache at the Cart
        // The removeQueries method can be used to remove queries from the cache based on their query keys or any other functionally accessible property/state of the query.
        queryClient.removeQueries(['purchases', { status: purchasesStatus.inCart }])
      }
    })
  }
  const changeLanguage = (lng: 'en' | 'vi') => {
    console.log('change')
    i18n.changeLanguage(lng)
  }


  const handleClickNotification = async (purchase: Notification) => {
    console.log(purchase)
    try {
      await notificationApi.updateNotification(purchase._id, {
        ...purchase,
        status: 'read'
      })
    if (purchase.type === 'friend_accept' || purchase.type === 'friend_remove') {
      navigate('/profile/' + purchase.sender)
    }
    if (purchase.type === 'message') {
      // navigate('/profile/' + purchase.sender)
    }
  } catch (error) {
    console.error(error)
      toast.error((error as any)?.response?.data?.message || 'Lỗi gửi lời mời kết bạn')
    }
  }

  const handleAcceptFriend = async (purchase: Notification) => {
    const body: FriendRequest = {
      senderPhone: purchase.receiver,
      receiverPhone: purchase.sender
    }
    try {
      await notificationApi.updateNotification(purchase._id, {
        ...purchase,
        status: 'read'
      })
      var res = await friendApi.sendFriendRequest(body)
      if (res.data === 'You can not send a friend request to yourself') {
        toast.warning(res.data)
    }else{
        toast.success(res.data)
      }
    } catch (error) {
      console.error(error)
      toast.error((error as any)?.response?.data?.message || 'Lỗi gửi lời mời kết bạn')
    }
  }

  const handleDeclineFriend = async (purchase: Notification) => {
    console.log(purchase)
    const body: FriendRequest = {
      senderPhone: purchase.sender,
      receiverPhone: purchase.receiver
    }
    try {
      await notificationApi.updateNotification(purchase._id, {
        ...purchase,
        status: 'read'
      })
      var res = await friendApi.unfriend(body)
      toast.success(res.data)
    } catch (error) {
      console.error(error)
      toast.error((error as any)?.response?.data?.message || 'Lỗi gửi lời mời kết bạn')
    }
  }
  
  const indexOfLastItem = currentPage * itemsPerPage
const indexOfFirstItem = indexOfLastItem - itemsPerPage
const currentNotifications = notifications?.slice(indexOfFirstItem, indexOfLastItem)

const totalPages = Math.ceil(notifications?.length || 0 / itemsPerPage)





  return (
    <div className='sticky top-0 z-20 bg-lime-200  pb-5 pt-2 text-white transition-[transform.2scubic-bezier(.4,0,.2,1)]'>
      <div className='container'>
        <div className='flex items-center justify-between'>
          <div className='flex justify-start gap-x-3 text-orange'>
            <p>Chat Center</p>
            <p>Download</p>
            <div className='flex'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-5 w-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418'
                />
              </svg>
              <span className='mx-1'>{currentLanguage}</span>
            </div>
          </div>
          <div className='flex justify-end'>
            <Popover
            
              as={'span'}
              className='relative flex cursor-pointer items-center py-1 hover:text-red-300 text-orange'
              renderPopover={
                <div className='relative rounded-sm border border-gray-200 bg-white shadow-md'>
                  <div className='flex flex-col py-2 pl-3 pr-28'>
                    <button className='py-2 px-3 text-left  hover:text-orange' onClick={() => changeLanguage('vi')}>
                      Tiếng Việt
                    </button>
                    <button className='mt-2 py-2 px-3 text-left hover:text-orange' onClick={() => changeLanguage('en')}>
                      English
                    </button>
                  </div>
                </div>
              }
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-5 w-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418'
                />
              </svg>
              <span className='mx-1'>Vietnamese</span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='h-5 w-5'
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' />
              </svg>
            </Popover>
            {isAuthenticated && (
              <Popover
                className='ml-6 text-orange flex cursor-pointer items-center py-1 hover:text-gray-300'
                renderPopover={
                  <div className='relative rounded-sm border border-gray-200 bg-white shadow-md'>
                    <Link to={path.profile} className='block w-full bg-white py-3 px-4 text-left hover:text-cyan-500'>
                      My Account
                    </Link>
                    {/* <Link
                      to={path.historyPurchase}
                      className='block w-full bg-white py-3 px-4 text-left hover:text-cyan-500'
                    >
                      My Purchase
                    </Link> */}
                    <button
                      onClick={handleLogout}
                      className='block w-full bg-white py-3 px-4 text-left hover:text-cyan-500'
                    >
                      Logout
                    </button>
                  </div>
                }
              >
                <div className='mr-2 h-5 w-5 flex-shrink-0'>
                  <img
                    src={getAvatarUrl(profile?.avatar)}
                    alt='avatar'
                    className='h-full w-full rounded-full object-cover'
                  />
                </div>
                <p>{profile?.email}</p>
              </Popover>
            )}
            {!isAuthenticated && (
              <div className='flex items-center'>
                <Link to={path.register} className='mx-3 capitalize hover:text-white/70'>
                  Register
                </Link>
                <div className='h-4 border-r-[1px] border-white/40' />
                <Link to={path.login} className='mx-3 capitalize hover:text-white/70'>
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className='mt-4 grid grid-cols-12 items-end gap-4'>
          <Link to='/'>
            <svg viewBox='0 0 192 65' className='mt-[-10px] mr-[-80px] h-[42px] fill-orange lg:h-11'>
              <g fillRule='evenodd'>
                <circle cx="30" cy="30" r="28" stroke="orange" stroke-width="2" fill="none" />
                <polygon 
                  points="30,8 48,19 48,41 30,52 12,41 12,19" 
                  fill="rgba(255,165,0,0.1)" 
                  stroke="orange"
                />
                <path 
                  d="M18,40 L22,22 L30,34 L38,22 L42,40" 
                  stroke="orange" 
                  stroke-width="3" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                />
              </g>
            </svg>
          </Link>
          <form className='col-span-9' onSubmit={onSubmitSearch}>
            <div className='flex h-[40px] rounded-none bg-white p-1'>
              <input
                placeholder='TÌM KIẾM NGƯỜI DÙNG THEO SỐ ĐIỆN THOẠI'
                type='text'
                className='h-[34px] flex-grow border-none bg-transparent p-2 text-black outline-none'
                {...register('name')}
              />
              <button className='flex-shrink-0 rounded-sm bg-lime-200 py-2 px-6 hover:opacity-50'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='h-4 w-4'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
                  />
                </svg>
              </button>
            </div>
          </form>
          <div className='col-span-1 justify-self-end'>
            <Popover
              placement='bottom-end'
              renderPopover={
                <div className='relative  max-w-[400px] rounded-sm border border-gray-200 bg-white text-sm shadow-md'>
                  {notifications && notifications.length > 0 ? (
                    <div className='p-2'>
                      <div className='capitalize text-gray-400'>Thông báo mới thêm</div>
                      <div className='mt-5'>
                        {notifications.slice(0, MAX_PURCHASES).map((purchase) => (
                          <div onClick={() => handleClickNotification(purchase)} className='mt-2 cursor-pointer flex p-2 hover:bg-gray-100 bg-gray-200' key={purchase._id}>
                            <div className='flex-shrink-0'>
                            <img
                              src={
                                purchase.type === 'message'
                                  ? 'https://cdn.tgdd.vn/hoi-dap/929605/cach-tat-tu-dong-luu-anh-tren-messenger-100.jpg'
                                  : 'https://png.pngtree.com/png-clipart/20190705/original/pngtree-vector-notification-icon-png-image_4187244.jpg'
                              }
                              alt={purchase.sender}
                              className="h-12 w-12 object-cover rounded-full"
                            />

   
                            </div>
                            <div className="ml-3 flex-grow overflow-hidden">
                              <div className="text-sm font-medium text-gray-800">
                              {purchase.content}
                              </div>
                            </div>
                            <div className='ml-2 flex-shrink-0'>
                              <div className='text-orange'>
                              {moment(purchase.timestamp).calendar(undefined, {
                                lastDay: "[Hôm qua] HH:mm",          // Nếu là hôm qua, hiển thị "Hôm qua" và giờ
                                lastWeek: "dddd HH:mm",              // Nếu là tuần trước, hiển thị tên ngày trong tuần và giờ
                                sameElse: "DD/MM/YYYY HH:mm:ss",    // Nếu không phải trong các trường hợp trên, hiển thị đầy đủ ngày giờ
                              })}
                              </div>
                              <div className='text-xs text-gray-500 mt-2'>
                                {purchase.status === 'unread' && (
                                  <span className="ml-2 inline-block h-3 w-3 rounded-full bg-blue-500" />
                                )}
                              </div>
                              {(purchase.type === 'friend_request' && purchase.status === 'unread') && (
                                <div className="mt-2 flex">
                                  <button onClick={() => handleAcceptFriend(purchase)} className="px-4 py-2 bg-green-500 text-white rounded-md mr-2">
                                    Accept
                                  </button>
                                  <button onClick={() => handleDeclineFriend(purchase)} className="px-4 py-2 bg-red-500 text-white rounded-md">
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className='mt-6 flex items-center justify-between'>
                        <div className='text-xs capitalize text-gray-500'>
                          {notifications.length > MAX_PURCHASES && (
                              <span>{notifications.length - MAX_PURCHASES} more marked as read</span>
                            )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex h-[300px] w-[300px] flex-col items-center justify-center p-2'>
                      <img src={noproduct} alt='no purchase' className='h-24 w-24' />
                      <div className='mt-3 capitalize'>Chưa có thông báo</div>
                    </div>
                  )}
                                <div className=' m-4 flex justify-center gap-2'>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className={`px-3 py-1 rounded bg-gray-200 text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                >
                  Prev
                </button>
                <span className="text-sm text-gray-600">Page {currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className={`px-3 py-1 rounded bg-gray-200 text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                >
                  Next
                </button>
              </div>
                </div>
              }
            >
              <Link to={path.cart} className='relative'>
              <AiOutlineBell className='w-8 h-8 text-orange' />
                {notifications && notifications.length > 0 && (
                  <span className='absolute top-[-5px] right-[-10px] rounded-full bg-white px-[9px] py-[1px] text-xs text-orange '>
                    {notifications?.length}
                  </span>
                )}
              </Link>


            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
}
