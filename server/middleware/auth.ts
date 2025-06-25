import { NextFunction, Request, Response } from 'express';
import { handleError } from '../utils/errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // For development purposes, add a mock user
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        id: 'dev-user-123',
        email: 'dev@example.com'
      };
      return next();
    }
    
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token (implement your token verification logic here)
    // This is a placeholder - replace with your actual token verification
    try {
      // Example: const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // req.user = { id: decoded.userId, email: decoded.email };
      
      // For now, we'll just pass through with a mock user
      req.user = {
        id: 'mock-user-123',
        email: 'user@example.com'
      };
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    handleError(res, error, 'Authentication failed');
  }
}; 