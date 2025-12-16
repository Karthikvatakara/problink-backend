import { Strategy as JwtStrategy } from 'passport-jwt';
import { Request } from 'express';
import { AppDataSource } from './database';
import { User } from '../entities/User';

const cookieExtractor = (req: Request) => {
  const token = req?.cookies?.token;
  console.log('Extracted token:', token); 
  return token || null;
};

export const passportStrategy = new JwtStrategy(
  {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET!, 
  },
  async (payload, done) => {
    try {
      console.log('JWT payload:', payload); 

      const userRepo = AppDataSource.getRepository(User);

      const user = await userRepo.findOne({
        where: { id: payload.userId }, 
      });

      console.log('User from DB:', user); 

      if (!user) {
        return done(null, false); 
      }

      return done(null, user); 
    } catch (err) {
      return done(err, false);
    }
  }
);
