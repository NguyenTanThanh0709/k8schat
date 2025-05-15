import React from 'react'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { User } from 'src/types/user.type'
import userApi from 'src/apis/user.api'
import {  useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

const UserP = () => {
    const { phone } = useParams()
    const { data: user, refetch: refetchProfile } = useQuery({
        queryKey: ['profile', phone],
        queryFn: () => userApi.getProfile(phone as string),
        enabled: !!phone
      })

      const navigate = useNavigate()



  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200">
        
      <div className="bg-gradient-to-r p-2 from-indigo-500 to-blue-500 h-32 relative">
                    <button
                onClick={() => navigate('/')}
                className="m-2 sm:mt-0 px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow"
            >
                Về trang chủ
            </button>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <img
            src={user?.data?.data?.avatar || 'https://i.pravatar.cc/150?img=3'}
            alt={user?.data?.data?.name}
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
          />
        </div>
      </div>
      <div className="pt-16 pb-8 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{user?.data.data.name || 'No name provided'}</h2>
        <p className="text-gray-500 mt-1">Người dùng</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm text-left text-gray-600">
          <div>
            <span className="block text-gray-400">Email</span>
            <span className="font-medium">{user?.data.data.email}</span>
          </div>
          <div>
            <span className="block text-gray-400">Phone</span>
            <span className="font-medium">{user?.data.data.phone || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-gray-400">Address</span>
            <span className="font-medium">{user?.data.data.address || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-gray-400">Date of Birth</span>
            <span className="font-medium">
              {user?.data.data.date_of_birth ? new Date(user?.data.data.date_of_birth).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Status</span>
            <span className={`font-medium ${user?.data.data.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
              {user?.data.data.status || 'N/A'}
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Created At</span>
            <span className="font-medium">{user?.data.data.createdAt}</span>
          </div>
          <div>
            <span className="block text-gray-400">Updated At</span>
            <span className="font-medium">{user?.data.data.updatedAt}</span>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-center sm:space-x-4">
            <button className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">
                THÔNG TIN
            </button>

        </div>

      </div>
    </div>
  )
}

export default UserP
