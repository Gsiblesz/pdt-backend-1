const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // Crear un usuario
  const newUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });
  console.log('Usuario creado:', newUser);

  // Leer todos los usuarios
  const users = await prisma.user.findMany();
  console.log('Todos los usuarios:', users);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
