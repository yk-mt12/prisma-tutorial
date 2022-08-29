import { createServer } from "@graphql-yoga/node";
import {
  dmmf,
  getPGBuilder,
  getPGPrismaConverter,
  PrismaTypes,
} from "@planet-graphql/core";
import { PrismaClient } from "@prisma/client";

const pg = getPGBuilder<{ Prisma: PrismaTypes }>();
const pgpc = getPGPrismaConverter(pg, dmmf);
const { objects } = pgpc.convertTypes();

const prisma = new PrismaClient({ log: ["query"] });
const usersQuery = pg.query({
  name: "users",
  field: (b) =>
    b
      .object(() => objects.User)
      .list()
      .prismaArgs((b) => ({
        take: b.int().default(10),
        skip: b.int().default(0),
      }))
      .resolve(({ prismaArgs }) => prisma.user.findMany(prismaArgs)),
});

const server = createServer({
  schema: pg.build([usersQuery]),
  maskedErrors: false,
});

server.start();
