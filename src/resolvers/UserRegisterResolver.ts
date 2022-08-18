import { ApolloError } from 'apollo-server';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  Resolver, Ctx, Mutation, Arg,
} from 'type-graphql';
import { User } from '../../prisma/generated/type-graphql';
import { Context } from '../types/context.interface';
import { UserRegisterInput } from './inputs';

@Resolver(() => User)
export class UserRegisterResolver {
  @Mutation(() => User)
  async register(
    @Ctx() { prisma }: Context,
    @Arg('data') args: UserRegisterInput,
  ): Promise<User> {
    let user!: User;
    try {
      user = await prisma.user.create({
        data: {
          name: args.name,
          email: args.email,
          password: await bcrypt.hash(args.password, 12),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') throw new ApolloError('Email is already taken!');
        else throw new ApolloError('Internal server error!');
      }
    }
    return user;
  }
}
