type Role = 'User' | 'Admin'

export interface User {
  _id: string
  roles: Role[]
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
}

export interface GroupReponse {
  group_id: string
  role: string
  joined_at: string
  group_name: string
  group_created_at: string
  group_owner: User
}

export interface Group {
  group_id: string
  role: string
  joined_at: string
  group_name: string
  group_created_at: string
}


export interface FriendListResponse {
  friends: User[]
}



export interface FriendRequest {
  senderPhone: string
  receiverPhone: string
}

