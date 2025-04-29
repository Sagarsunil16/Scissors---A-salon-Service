import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface CustomRequest extends Request {
  user?: any;
}

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      res.status(401).json({ message: 'No token provided, authorization denied' });
      return; 
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = decoded;
    next(); 
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

export default verifyToken;
