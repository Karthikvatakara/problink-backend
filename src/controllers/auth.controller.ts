import { Request, Response } from 'express';
import { AppDataSource } from "../config/database";
import { User } from '../entities/User';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';


export class AuthController {
    static async register(req:Request, res:Response):Promise<Response>{
        try{
            const registerDto = plainToInstance(RegisterDto,req.body);
            const errors = await validate(registerDto);

            if(errors.length > 0){
                return res.status(400).json({
                    message: "validation failed",
                    errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
                })
            }

            const userRepository = AppDataSource.getRepository(User);

            const existingUser = await userRepository.findOne({
                where: { email : registerDto.email }
            })

            if(existingUser){
                return res.status(400).json({ message: "user with this email already exist" })
            }

            const hashedPassword = await bcrypt.hash(registerDto.password,10);

            const user = userRepository.create({
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name
            })

            await userRepository.save(user);

            const jwtSecret: string = process.env.JWT_SECRET || 'jwtsecret';
            const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: expiresIn } as jwt.SignOptions
      );
            
    //   res.cookie("token", token, {
    //             httpOnly: true,
    //             secure: true,
    //             sameSite:"none",
    //         });
            
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // false in dev
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "lax" in dev
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            
            return res.status(200).json({
                message: "user registered succesfully",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            })
        }catch(error){
            console.log('registration error',error);
            return res.status(500).json({message:"internal server error",error:error})
        }
    }



    static async login(req:Request, res:Response) : Promise<Response>{
        try{
            const loginDto = plainToInstance(LoginDto,req.body);
            const errors = await validate(loginDto);

            if(errors.length > 0){
                return res.status(400).json({
                    message: "validation failed",
                    errors: errors.map((e: any) => Object.values(e.constraints || {})).flat(),
                })
            }

            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOne({
                where: { email: loginDto.email}
            })

            if(!user){
                return res.status(401).json({message:"invalid email or password"})
            }

            const isPasswordValid = await bcrypt.compare(loginDto.password,user.password);

            if(!isPasswordValid){
                return res.status(401).json({message:"invalid email or password"});
            }

            const jwtSecret : string = process.env.JWT_SECRET ||"jwtsecret";
            const expiresIn : string = process.env.JWT_EXPIRES_IN || '7d';

             const token = jwt.sign(
                { userId: user.id, email: user.email },
                jwtSecret,
                 { expiresIn: expiresIn } as jwt.SignOptions
             );

            //   res.cookie("token", token, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite:"none",
            // });


            res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // false in dev
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "lax" in dev
  maxAge: 7 * 24 * 60 * 60 * 1000,
});


             return res.status(200).json({
                message:"login succesfull",
                token,
                user:{
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
             })
        }catch(error){
            console.log('login error',error);
            return res.status(500).json({message:"internal server error",error:error});
        }
    }


    static async logout(req: Request, res: Response): Promise<Response> {
        try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return res.status(200).json({
            message: "Logged out successfully",
         });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Logout failed",
    });
  }
}

}