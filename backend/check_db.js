const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => ({ username: u.username, role: u.role, name: u.name })));
  
  const appts = await prisma.appointment.findMany();
  console.log("Appointments count:", appts.length);
  console.log("Appointments details:", appts.map(a => ({
    id: a.id,
    patientName: a.patientName,
    doctorName: a.doctorName,
    date: a.date,
    time: a.time,
    status: a.status
  })));
  
  const today = new Date().toISOString().split("T")[0];
  console.log("Current Today Date:", today);
}

main().catch(console.error).finally(() => prisma.$disconnect());
