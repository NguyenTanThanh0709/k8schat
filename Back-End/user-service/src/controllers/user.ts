import {Request,Response, } from 'express'
import {User, SuccessResponse } from '../interface/type'

import {
    findUsersByPhone,
    updateUserProfileService,
    changeUserPasswordService,
    updateUserStatusByPhoneService,
    getProfileByPhone,
    getUsersWithOptionalSearchAndPaginationService,
    getUserFriendsServiceControll
    } from '../services/user.service';


  export const getUsersByPhone = async (req: Request, res: Response): Promise<void> => {
    const { phone } = req.params;
  
    try {
      const user = await getProfileByPhone(phone);
      if (!user) {
        res.status(404).json({ message: 'User not found', data: { user: null } });
        return;
      }
      const response: SuccessResponse<User> = {
        message: 'User fetched successfully',
        data:  user 
      };
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error fetching users by phone:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
  

export const getUsersByPhoneLike = async (req: Request, res: Response): Promise<void> => {
    const { phone } = req.params;
  
    try {
      const users = await findUsersByPhone(phone);
      res.status(200).json(users);
    } catch (error: any) {
      console.error('Error fetching users by phone:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

// ✏️ Cập nhật profile user
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    const { phone } = req.params;
    const { name, email, avatar } = req.body;
  
    try {
      const updatedUser = await updateUserProfileService(phone, {
        name,
        email,
        avatar
      });

      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
  
      const response: SuccessResponse<User> = {
        message: 'User fetched successfully',
        data:  updatedUser
      };
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const changeUserPassword = async (req: Request, res: Response): Promise<void> => {
    const { phone } = req.params;
    const { password, new_password, confirm_password } = req.body;
  
    if (!password || !new_password) {
      res.status(400).json({ error: 'Old and new passwords are required' });
      return;
    }
  
    if (new_password.length < 3) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }
  
    try {
      const updatedUser = await changeUserPasswordService(phone, password, new_password);
      res.status(200).send('Password changed successfully');

    } catch (error: any) {
      console.error('Error changing password:', error);
      res.status(400).json({ error: error.message || 'Failed to change password' });
    }
};

 // 🔄 Cập nhật trạng thái user
export const updateUserStatusByPhone = async (req: Request, res: Response): Promise<void> => {
    const { phone } = req.params;
    const { status } = req.body;
  
    if (!status || (status !== 'ONLINE' && status !== 'OFFLINE')) {
      res.status(400).json({ error: 'Status must be either ONLINE or OFFLINE' });
      return;
    }
  
    try {
      const user = await updateUserStatusByPhoneService(phone, status);
      res.status(200).json({ message: 'Status updated successfully', user });
    } catch (error: any) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}; 


export const getPaginatedUsers = async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.params;
  const page = parseInt(req.query.page as string) || 0;
  const pageSize = parseInt(req.query.pageSize as string) || 5;
  const name = req.query.name as string | undefined;
  const sortBy = req.query.sort_by as string | undefined; // Add sort_by query parameter
  console.log(phone, page, pageSize, name, sortBy)
  try {
    const result = await getUsersWithOptionalSearchAndPaginationService(phone, page, pageSize, name,sortBy);
    
    const response: SuccessResponse<typeof result> = {
      message: 'Users fetched successfully',
      data: result
    };
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching users with pagination:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};


export const getUserFriendsController = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const name = req.query.name as string | undefined;

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid phone parameter' });
    }

    const friends = await getUserFriendsServiceControll(phone,name);

    return res.status(200).json({ friends });
  } catch (error: any) {
    console.error('Error fetching user friends:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};