import 'reflect-metadata';
import { ApolloServer, CorsOptions } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import { buildSchema, Authorized } from 'type-graphql';
import { env } from 'process';
import authChecker, { Rule } from 'typegraphql-authchecker';
import { resolvers, ResolversEnhanceMap, applyResolversEnhanceMap } from '../prisma/generated/type-graphql';
// import { authChecker } from './auth/auth-checker';
import { Context } from './types/context.interface';
import { getUser } from './utils/auth';
import { UserLoginResolver, UserRegisterResolver } from './resolvers';

const bootstrap = async () => {
  const isAuthenticated: Rule<Context> = ({
    root, info, args, context,
  }) => true;
  // console.log(context);
  // if (context.user) {
  //   return true;
  // } ds
  // true;
  const isUserAdmin: Rule<Context> = ({
    root, info, args, context,
  }) => true;
  // console.log(args);
  // if (context.user && context.user.roles.includes('ADMIN')) return true;
  // true;
  const isUserPostAuthor: Rule<Context> = ({
    args, context,
  }) => true;
    // const post = await context.prisma.post.findUnique({
    //   where: {
    //     id: args.where.id,
    //   },
    // });
    // if (post && context.user && post.authorId === context.user.id) {
    //   console.log('isUserPostAuthor: true');
    //   return true;
    // }
    // true;
  const resolversEnhanceMap: ResolversEnhanceMap = {
    User: {
      users: [Authorized([isAuthenticated, isUserAdmin])],
      user: [Authorized([isUserAdmin])],
    },
    Post: {
      post: [Authorized([{ AND: [isUserPostAuthor, isUserAdmin] }])],
    },
  };

  applyResolversEnhanceMap(resolversEnhanceMap);

  const schema = await buildSchema({
    resolvers: [...resolvers, UserLoginResolver, UserRegisterResolver],
    validate: false,
    authChecker,
  });

  // console.log(schema);

  const freeCors: CorsOptions = {
    allowedHeaders: '*',
    methods: 'GET, POST',
    origin: '*',
  };

  const prisma = new PrismaClient();
  await prisma.$connect();

  const server = new ApolloServer({
    schema,
    cors: freeCors,
    context: ({ req }): Context => ({
      prisma,
      token: req.headers?.authorization?.split(' ')[1],
    }),
  });

  const port = env.PORT ?? 4000;

  const { url } = await server.listen(port);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
};

bootstrap().catch(console.error);

// https://prisma.typegraphql.com/docs/advanced/additional-decorators
// https://typegraphql.com/docs/authorization.html
