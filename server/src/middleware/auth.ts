import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token with Clerk
    const clerk = clerkClient();
    const session = await clerk.verifyToken(token);
    
    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.userId = session.sub; // Clerk user ID
    // You can fetch user metadata for role if needed
    const user = await clerk.users.getUser(session.sub);
    req.userRole = (user.publicMetadata?.role as string) || 'user';
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
