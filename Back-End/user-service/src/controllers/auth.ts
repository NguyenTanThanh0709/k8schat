import {Request,Response} from 'express'
import { AppDataSource } from '../database/data-source'
import { User } from '../database/entities/UserEntity'
import {User as UserInterface, AuthResponse, RegisterFormData } from '../interface/type'

export const login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: { email: string; password: string } = req.body;
    if(!email || !password){
        return res.status(400).json({message:'All fields are required'})
    }
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });
        if(!user){
            return res.status(400).json({message:'User not found'})
        }
        const isPasswordValid = password === user.password_hash;
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const authResponse: AuthResponse = {
          message: 'User Login successfully',
          data: {
            access_token: "accessToken",
            refresh_token: "refreshToken",
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 giờ sau
            expires_refresh_token: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày sau
            user: user
          }
        };

        return res.status(200).json(authResponse);
        

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
};

export const register = async (req:Request, res:Response): Promise<Response> => {
    const {email,phone,password,confirm_password,term_of_use} : RegisterFormData = req.body
    if(!phone ||  !email || !password){
        return res.status(400).json({message:'All fields are required'})
    }
    try {
        const userRepository = AppDataSource.getRepository(User);
        let existingUser = await userRepository.findOne({
          where: [{ phone }, { email }],
        });
        if (existingUser) {
          const reason = 
            existingUser.phone === phone ? 'Phone already exists' :
            existingUser.email === email ? 'Email already exists' :
            'User already exists';
        
          return res.status(400).json({ message: reason });
        }
        const newUser = new User();
        newUser.phone = phone;
        newUser.name = '';
        newUser.email = email;
        newUser.password_hash = password;


        const savedUser = await userRepository.save(newUser);


        const authResponse: AuthResponse = {
          message: 'User registered successfully',
          data: {
            access_token: "accessToken",
            refresh_token: "refreshToken",
            expires: Date.now() + 60 * 60 * 1000, // 1 giờ sau
            expires_refresh_token: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày sau
            user: savedUser
          }
        };
        
        return res.status(201).json(authResponse);
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }  
}

export const logout = async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).json({ message: 'User logged out successfully' });
};