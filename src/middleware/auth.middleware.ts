import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../entities/User';

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: any, user: User | false) => {
      if (err) {
        console.error('JWT auth error:', err);
        return res.status(500).json({ message: 'Authentication error' });
      }
      console.log(user,"it is the user")
      console.log(req.user,"body of user")
      if (!user) {
        return res.status(401).json({
          message: 'Unauthorized - Invalid or expired token',
        });
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};
