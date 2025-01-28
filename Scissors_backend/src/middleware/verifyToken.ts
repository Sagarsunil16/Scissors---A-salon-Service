import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: any;
}

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies.authToken;
    console.log(token)
    if (!token) {
      res.status(401).json({ message: 'No token provided, authorization denied' });
      return;  // Return here to stop further execution
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = decoded;

    next();  // Proceed to the next middleware/route handler
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;  // Return here to stop further execution
  }
};

export default verifyToken;
