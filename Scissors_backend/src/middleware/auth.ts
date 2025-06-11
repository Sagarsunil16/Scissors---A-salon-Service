import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { salonService, userService } from '../container/di';
import { ROLES } from '../constants';
import { CustomRequest } from './verifyToken';

interface JwtPayload {
  id: string;
  role: string;
}

const auth = (roles: string[], requireEntity: boolean = false) => {
  return async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies.authToken;
      if (!token) {
        res.status(401).json({ message: 'No token provided, authorization denied' });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      if (!roles.includes(decoded.role)) {
        res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        return;
      }

      let entity;
      if (requireEntity) {
        if (decoded.role === ROLES.USER || decoded.role === ROLES.ADMIN) {
          entity = await userService.getUserById(decoded.id);
          if (!entity) {
            res.status(404).json({ message: 'User not found' });
            return;
          }
          if (!entity.is_Active) {
            res.status(403).json({ message: 'Access denied. User is blocked.' });
            return;
          }
        } else if (decoded.role === ROLES.SALON) {
          entity = await salonService.findSalon(decoded.id);
          if (!entity) {
            res.status(404).json({ message: 'Salon not found' });
            return;
          }
          if (!entity.is_Active) {
            res.status(403).json({ message: 'Access denied. Salon is blocked.' });
            return;
          }
        }
      }

      req.user = { id: decoded.id, role: decoded.role, entity };
      next();
    } catch (error) {
      console.log(error)
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
  };
};

export default auth;