const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());


// Endpoint para guardar un registro de panadería
app.post('/registros', async (req, res) => {
  try {
    const { fecha, ...rest } = req.body;
    const registro = await prisma.registro.create({
      data: {
        fecha: fecha || '',
        data: req.body, // Guarda todo el objeto recibido
      },
    });
    res.status(201).json(registro);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint para obtener todos los registros
app.get('/registros', async (req, res) => {
  try {
    const registros = await prisma.registro.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
