import { User } from "./user.interface";
import { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
  user?: User;
}