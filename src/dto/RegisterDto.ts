import { IsEmail, IsString, MinLength, IsNotEmpty, isNotEmpty } from 'class-validator';

export class RegisterDto{
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @isNotEmpty()
    

}