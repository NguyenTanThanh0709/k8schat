export interface UserT {
  email: string
  name?: string
  date_of_birth?: string // ISO 8610
  avatar?: string
  address?: string
  phone?: string
  status?: string
  password_hash?: string
  createdAt: string
  updatedAt: string
  isFriend?: boolean
}
export interface UserTList {
  users: UserT[]
  pagination: {
    page: number
    limit: number 
    page_size: number
  }
}

export interface UserTListConfig {
  page?: number | string
  limit?: number | string
  sort_by?: 'createdAt' | 'price' | 'rating' | 'sold' | 'view'
  order?: 'asc' | 'desc'
  name?: string
}


export interface FriendTListConfig {
  name?: string
}

export interface GroupTListConfig {
  name?: string
}
