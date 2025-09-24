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
    // Paginación opcional
    const take = Math.max(0, parseInt(req.query.take)) || undefined; // undefined = sin límite
    const skip = Math.max(0, parseInt(req.query.skip)) || undefined;
    const registros = await prisma.registro.findMany({
      orderBy: { createdAt: 'desc' },
      ...(typeof take === 'number' ? { take } : {}),
      ...(typeof skip === 'number' ? { skip } : {}),
    });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Total de registros (para paginación opcional)
app.get('/registros/count', async (_req, res) => {
  try {
    const count = await prisma.registro.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar todos los registros
app.delete('/registros', async (req, res) => {
  try{
    const del = await prisma.registro.deleteMany({});
    res.json({ deleted: del.count });
  }catch(error){ res.status(500).json({ error: error.message }); }
});

// Eliminar un registro por id
app.delete('/registros/:id', async (req, res) => {
  try{
    const id = parseInt(req.params.id);
    if(Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    const del = await prisma.registro.delete({ where: { id } });
    res.json({ deleted: del.id });
  }catch(error){
    // Si el registro no existe, Prisma lanza P2025: devolver 404 en lugar de 500
    if (error && (error.code === 'P2025' || /No record was found/i.test(String(error.message||'')))) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una sola amasadora de un registro por índice
app.delete('/registros/:id/amasadoras/:index', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = parseInt(req.params.index);
    if (Number.isNaN(id) || Number.isNaN(index)) {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }
    const registro = await prisma.registro.findUnique({ where: { id } });
    if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
    const data = registro.data || {};
    const amasadoras = Array.isArray(data.amasadoras) ? [...data.amasadoras] : [];
    if (index < 0 || index >= amasadoras.length) {
      return res.status(404).json({ error: 'Amasadora no encontrada en el registro' });
    }
    amasadoras.splice(index, 1);
    if (amasadoras.length === 0) {
      // Si ya no quedan amasadoras, eliminar el registro completo
      await prisma.registro.delete({ where: { id } });
      return res.json({ deletedRegistro: id, amasadorasRestantes: 0 });
    } else {
      const newData = { ...data, amasadoras };
      const updated = await prisma.registro.update({ where: { id }, data: { data: newData } });
      return res.json({ updatedId: updated.id, amasadorasRestantes: amasadoras.length });
    }
  } catch (error) {
    if (error && (error.code === 'P2025' || /No record was found/i.test(String(error.message||'')))) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
