import { PrismaClient } from '@prisma/client';
import { User } from './user.interface';

export interface Context {
  prisma: PrismaClient;
  token: any;
}
