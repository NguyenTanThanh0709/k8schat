import {Request,Response, } from 'express'
import {User, SuccessResponse } from '../interface/type'


import {
    sendFriendRequestService,
    unfriendUserService
  } from '../services/friend.service';


  export const sendFriendRequestController = async (req: Request, res: Response) => {
    try {
      const { senderPhone, receiverPhone } = req.body
  
      if (!senderPhone || !receiverPhone) {
        return res.status(400).json({ message: 'Missing senderPhone or receiverPhone.' })
      }
  
      const result = await sendFriendRequestService(senderPhone, receiverPhone)
  
      return res.status(200).json( result )
    } catch (error) {
      console.error('Error in sendFriendRequestController:', error)
      return res.status(500).json('Internal Server Error')
    }
  }  


  export const unfriendUserController = async (req: Request, res: Response) => {
    try {
      const { senderPhone, receiverPhone } = req.body
  
      if (!senderPhone || !receiverPhone) {
        return res.status(400).json('userPhone và friendPhone là bắt buộc.')
      }
  
      await unfriendUserService(senderPhone, receiverPhone)
  
      return res.status(200).json('Hủy kết bạn thành công.')
    } catch (error) {
      console.error('Lỗi khi hủy kết bạn:', error)
      return res.status(500).json('Hủy kết bạn thất bại.')
    }
  }