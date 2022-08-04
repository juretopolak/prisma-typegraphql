import 'reflect-metadata';
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { buildSchema } from 'type-graphql';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { expressjwt as jwt } from "express-jwt";
import { resolvers } from './prisma/generated/type-graphql';
import { authChecker } from "./auth/auth-checker"
import { Context } from './auth/context.interface'

// interface Context {
//   prisma: PrismaClient;
//   req: any
// }

async function main() {

  const app = express();

  const schema = await buildSchema({
    resolvers,
    emitSchemaFile: path.resolve(__dirname, './generated-schema.graphql'),
    validate: false,
    authChecker,
  });

  const prisma = new PrismaClient();
  await prisma.$connect();

  const server = new ApolloServer({
    schema,
    context: () => {
      const ctx: Context = {
        // create mocked user in context
        // in real app you would be mapping user from `req.user` or sth
        user: {
          id: 1,
          name: "Sample user",
          roles: ["REGULAR"],
        },
      };
      return ctx;
    }
    //context: (): Context => ({ req, prisma }) => {},
  });

  const urlPath = "/graphql";

  app.use(
    urlPath,
    jwt({
      secret: "TypeGraphQL",
      credentialsRequired: false,
      algorithms: ["HS256"],
    }),
  );

  server.applyMiddleware({ app, path: urlPath});

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
  );

}

main().catch(console.error);
