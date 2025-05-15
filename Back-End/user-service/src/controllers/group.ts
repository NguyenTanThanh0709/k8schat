import {Request,Response, } from 'express'
import {User, SuccessResponse } from '../interface/type'


import {
    createGroupService,
    getGroupsByUserPhone,
    getGroupMembersByGroupId,
    addMembersToGroup,
    removeMemberFromGroup
  } from '../services/group.service';

  export const createGroupController = async (req: Request, res: Response) => {
    const { ownerPhone, name } = req.body
  
    if (!ownerPhone || !name) {
      return res.status(400).json({ message: 'Thiếu owner_phone hoặc name' })
    }
  
    try {
      const group = await createGroupService({ ownerPhone, name })
      
      return res.status(201).json({ message: 'Tạo group thành công' })
    } catch (error: any) {
      console.error('Lỗi tạo group:', error)
      return res.status(500).json({ message: error.message || 'Lỗi server' })
    }
  } 


  export const getUserGroupsController = async (req: Request, res: Response) => {
    const { phone } = req.params;
    const name = req.query.name as string | undefined;
  
    if (!phone) {
      return res.status(400).json({ message: 'Thiếu phone' })
    }
  
    try {
      const groups = await getGroupsByUserPhone(phone,name)
      res.status(200).json({ message: 'Lấy danh sách nhóm thành công', data: groups })
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách nhóm:', error)
      res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
  }


  export const getGroupMembersHandler = async (req: Request, res: Response) => {
    try {
      const groupId = Number(req.params.groupId);
      if (isNaN(groupId)) {
        return res.status(400).json({ message: 'Invalid group ID' });
      }
  
      const members = await getGroupMembersByGroupId(groupId);
      return res.status(200).json( members );
    } catch (error: any) {
      console.error('Error getting group members:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  };

  export const addMembersToGroupController = async (req: Request, res: Response) => {
    try {
      const groupId = Number(req.params.groupId);
      const { memberPhones } = req.body;
  
      if (!groupId || !Array.isArray(memberPhones) || memberPhones.length === 0) {
        return res.status(400).json({ message: 'Invalid groupId or memberPhones' });
      }
  
      const members = await addMembersToGroup(groupId, memberPhones);
  
      return res.status(200).json({
        message: 'Members added successfully',
        data: members,
      });
    } catch (error: any) {
      console.error('Error adding members to group:', error);
      return res.status(500).json({
        message: error.message || 'Internal server error',
      });
    }
  };
  
  export const removeGroupMemberController = async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const userPhone = req.params.userPhone;
  
      if (isNaN(groupId) || !userPhone) {
        return res.status(400).json({ message: 'Invalid groupId or userPhone' });
      }
  
      const result = await removeMemberFromGroup(groupId, userPhone);
  
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error removing member:', error);
      return res.status(500).json("Error");
    }
  };