import {
  Resolver, Ctx, Mutation, Arg, Query, Info,
} from 'type-graphql';
import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { User } from '../../prisma/generated/type-graphql';
import { transformCountFieldIntoSelectRelationsCount, transformFields } from '../../prisma/generated/type-graphql/helpers';
import { Context } from '../types/context.interface';
import { UserLoginInput } from './inputs';
import { generateToken, getUser } from '../utils';

@Resolver(() => User)
export class UserLoginResolver {
  @Mutation(() => String)
  async login(
    @Ctx() { prisma }: Context,
    @Arg('data') args: UserLoginInput,
  ): Promise<string | null> {
    const token = generateToken(prisma, args);
    return token;
  }

  @Query(() => User, { nullable: true })
  async getCurrentUser(
    @Ctx() { prisma, token }: Context,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User | null> {
    try {
      const { id } = getUser(token);
      const { _count } = transformFields(
        graphqlFields(info as any),
      );
      return prisma.user.findUnique({
        where: {
          id,
        },
        ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
      });
    } catch {
      return null;
    }
  }
}
