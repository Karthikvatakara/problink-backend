import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { AppDataSource } from "./database";
import { User } from "../entities/User";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
};

export const passportStrategy = new JwtStrategy(opts, async (payload, done) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: payload.userId } });

    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
});