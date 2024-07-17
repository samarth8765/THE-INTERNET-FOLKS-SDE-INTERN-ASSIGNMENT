import { PrismaClient } from "@prisma/client";
import { generateSnowFlakeId } from "../src/utils/snowflake";

const prisma = new PrismaClient();

async function seedUsers() {
  await prisma.user.create({
    data: {
      id: generateSnowFlakeId(),
      name: "John Snow",
      email: "johnsnow@gmail.com",
      password: "password",
    },
  });

  await prisma.role.createMany({
    data: [
      {
        id: generateSnowFlakeId(),
        name: "Community Admin",
      },
      {
        id: generateSnowFlakeId(),
        name: "Community Moderator",
      },
      {
        id: generateSnowFlakeId(),
        name: "Community Member",
      },
    ],
  });
}

seedUsers()
  .then(async () => {
    console.log("Seeding Completed");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  });
