import { useQuery  } from '@tanstack/react-query'
import userApi from 'src/apis/user.api'
import { useState } from 'react'
// import categoryApi from 'src/apis/categoriest'
import Pagination from 'src/components/Pagination'
import useQueryConfig from 'src/hooks/useQueryConfig'
import { UserTListConfig, UserT as ProductType } from 'src/types/product.type'
import AsideFilter from './components/AsideFilter'
import AsideFilterMessage from './components/AsideFilterMessage'
import AsideFilterMessageGroup from './components/AsideFilterMessageGroup'
import SortProductList from './components/SortUserList'
import { Head } from 'src/components/head'
import ChatBox from './components/ChatBox'
import { User } from 'src/types/user.type'
import UserComponent from './components/User/User'
import { MessagesProvider } from 'src/contexts/MessagesContext';


export default function UserList() {
  const queryConfig = useQueryConfig()
  const [selectedCategory, setSelectedCategory] = useState('1')
  const { data: profileDataLS, refetch } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const raw = localStorage.getItem('profile');
      if (!raw) throw new Error('No profile found in localStorage');
      return JSON.parse(raw) as User;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return userApi.getListUser(queryConfig as UserTListConfig, profileDataLS?.phone as string)
    },
    enabled: !!profileDataLS?.phone && selectedCategory === '3',
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000
  })
  // console.log(productsData?.data.data)


  const categoriesDataFEATURE = [
    { _id: '1', name: 'Bạn bè' ,icon:'✅' },
    { _id: '2', name: 'Nhóm', icon:'🎁' },
    { _id: '3', name: 'Tìm kiếm người dùng', icon:'💻' }
  ]


  const handleChangeCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  

  return (
    <MessagesProvider>
    <div className='bg-gray-200 py-6'>
      <Head title={'Trang chủ | Shopee Clone'} />
      <div className='container-fluid'>
        <div className=' grid grid-cols-12 gap-6'>
          <div className='col-span-5'>


            <AsideFilter
              categories={categoriesDataFEATURE}
              selectedCategory={selectedCategory}
              onChangeCategory={handleChangeCategory}
            />

            {/* categoriesDataFEATURE có id = 1 thì hiện cái này */}

            {(selectedCategory === '1' || selectedCategory === '3') && (
              // <AsideFilterMessageGroup} />
              <AsideFilterMessage selectedCategory={selectedCategory} />
            )}

            {/* categoriesDataFEATURE có id = 2 thì hiện cái này */}
            {selectedCategory === '2' && (
              <AsideFilterMessageGroup selectedCategory={selectedCategory} />
            )}


          </div>

      {/* Nếu category === '3' thì hiển thị danh sách sản phẩm */}
      {selectedCategory === '3' ? (
          productsData ? (
            <div className='sticky z-10 col-span-7'>
              <SortProductList
                queryConfig={queryConfig}
                pageSize={productsData.data.data.pagination.page_size}
              />
              <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'>
                {productsData.data.data.users.map((product: ProductType) => (
                  <div className='col-span-1' key={product.phone}>
                    <UserComponent product={product} profileDataLS={profileDataLS as User} />
                  </div>
                ))}
              </div>
              <Pagination
                queryConfig={queryConfig}  
                pageSize={productsData.data.data.pagination.page_size}
              />
            </div>
          ) : null
        ) : (
          <div className='sticky z-10 col-span-7'>
            <ChatBox selectedCategory={selectedCategory} />
          </div>
        )}



        </div>
      </div>
    </div>
    </MessagesProvider>
  )
}
