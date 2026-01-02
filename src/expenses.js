import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

export default async function handler(request, response) {
  // Configuración de CORS para permitir peticiones desde tu frontend
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responder a las peticiones "preflight" de CORS
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  const { user } = request.method === 'GET' ? request.query : request.body;

  if (!user) {
    return response.status(400).json({ error: 'Usuario requerido' });
  }

  const key = `expense_tracker:${user}`;

  try {
    // Conectar al cliente si no está abierto
    if (!client.isOpen) {
      await client.connect();
    }

    if (request.method === 'POST') {
      // Guardar datos
      const { cards, otherExpenses } = request.body;
      await client.set(key, JSON.stringify({ cards, otherExpenses }));
      return response.status(200).json({ success: true });
    } else if (request.method === 'GET') {
      // Leer datos
      const data = await client.get(key);
      return response.status(200).json(data ? JSON.parse(data) : { cards: [], otherExpenses: [] });
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}