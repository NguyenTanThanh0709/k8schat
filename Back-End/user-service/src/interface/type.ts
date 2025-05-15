export interface User {
    phone: string;
    name: string;
    email: string;
    password_hash?: string;
    avatar?: string | null;
    status?: 'ONLINE' | 'OFFLINE' | string | null;
    createdAt?: Date | null;
}

export type FriendStatus = 'no' | 'pending' | 'accepted' | 'blocked';

export interface Friend {
  user_phone: string;
  friend_phone: string;
  status: FriendStatus;
  created_at?: Date | null;
}

export interface Group {
    id: bigint;
    name: string;
    owner_phone: string;
    created_at?: Date | null;
}
  
export type GroupRole = 'member' | 'admin' | 'owner';

export interface GroupMember {
    group_id: bigint;
    user_phone: string;
    role?: GroupRole;
    status: boolean;
    joined_at?: Date;
}

export interface CreateGroupInput {
  name: string;
  ownerPhone: string;
}


export interface ErrorResponse<Data> {
  message: string
  data?: Data
}
export interface SuccessResponse<Data> {
  message: string
  data: Data
}



// syntax '-?' will remove property undefined of key optional
export type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>
}

export type AuthResponse = SuccessResponse<{
  access_token: string
  refresh_token: string
  expires: number
  expires_refresh_token: number
  user: User
}>

export interface RegisterFormData {
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  term_of_use: boolean; // true nếu người dùng đồng ý điều khoản sử dụng
}


export interface GroupMemberInfo {
  group_id: string;
  user_phone: string;
  role: 'member' | 'admin' | 'owner';
  joined_at: string; // ISO date string
  status: number; // 1 = active
  name: string;
  email: string;
  avatar: string | null;
  user_status: string; // OFFLINE, ONLINE, etc.
}
