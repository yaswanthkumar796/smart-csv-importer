module.exports = {
  earlyAccess: true,
  schema: {
    kind: "single",
    filePath: "prisma/schema.prisma",
  },
  database: {
    url: process.env.DATABASE_URL,
  },
};
