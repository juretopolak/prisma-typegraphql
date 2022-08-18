import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { env } from 'process';
import { AuthenticationError } from 'apollo-server';
import { UserLoginInput } from '../resolvers/inputs';
import type { User } from '../../prisma/generated/type-graphql';

const JWT_KEY = env.JWT_KEY ?? 'dev-key';

export const generateToken = async (prisma: PrismaClient, userInput: UserLoginInput) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userInput.email,
      },
    });

    if (!user) throw new AuthenticationError('User with that e-mail doesn\'t exist');

    const match = await bcrypt.compare(userInput.password, user.password);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if (!match) throw new AuthenticationError('Incorrect passwprd');

    return sign(
      {
        id: user.id,
      } as Partial<User>,
      JWT_KEY,
      {
        algorithm: 'HS256',
        expiresIn: '7d',
      },
    );
  } catch {
    throw new AuthenticationError('Generation of token has failed.');
  }
};

export const getUser = (token: string) => {
  if (token === '') { throw new AuthenticationError('No token provided'); }

  try {
    const user = verify(token, JWT_KEY);
    return user as Partial<User>;
  } catch {
    throw new AuthenticationError('Failed to authenticate token');
  }
};
