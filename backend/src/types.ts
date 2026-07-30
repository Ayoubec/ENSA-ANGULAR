import { Role } from '@prisma/client';
declare global {
  namespace Express {
    interface Request { auth?: { id: number; role: Role }; }
  }
}
export {};
