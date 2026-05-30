import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDB() {
  console.log("Resetting database...");
  await prisma.message.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.article.deleteMany();
  await prisma.patientRecord.deleteMany();
  await prisma.painPoint.deleteMany();
  await prisma.user.deleteMany();
  console.log("All tables cleared.");
}

resetDB().then(() => {
  console.log("Run 'bun run dev' now to trigger the new seedDatabase().");
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
