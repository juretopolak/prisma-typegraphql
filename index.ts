import 'reflect-metadata';
import path from 'path';
import { ApolloServer, CorsOptions } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import { buildSchema, Authorized } from 'type-graphql';
import { resolvers } from './prisma/generated/type-graphql';
import { ResolversEnhanceMap, applyResolversEnhanceMap } from './prisma/generated/type-graphql';
import { authChecker } from './auth/auth-checker'
import { Context } from './auth/context.interface'
import { env } from 'process';

const bootstrap = async () => {

  const resolversEnhanceMap: ResolversEnhanceMap = {
    User: {
      users: [Authorized('ADMIN','KRNEKI')],
      user: [Authorized('KRNEKI')]
    },
  };
  
  applyResolversEnhanceMap(resolversEnhanceMap);

  const schema = await buildSchema({
    resolvers,
    emitSchemaFile: path.resolve(__dirname, './generated-schema.graphql'),
    validate: false,
    authChecker,
  });

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
    context: () => {
      const ctx: Context = {
        prisma,
        user: {
          id: 1,
          name: 'Sample user',
          roles: ['ADMIN'],
        },
      };
      return ctx;
    }
  });

  const port = env.PORT ?? 4000;

  const { url } = await server.listen(port);
  console.log(`Server is running, GraphQL Playground available at ${url}`);

}

bootstrap().catch(console.error);

// https://prisma.typegraphql.com/docs/advanced/additional-decorators
// https://typegraphql.com/docs/authorization.html