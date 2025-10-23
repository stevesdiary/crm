import { Request, Response, NextFunction } from 'express';

export const tenantIsolation = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.tenantId) {
    return res.status(403).json({ message: 'Tenant context required' });
  }
  next();
};
