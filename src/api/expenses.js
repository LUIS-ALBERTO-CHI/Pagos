import { createClient } from 'redis';

// 1. Configuración del cliente
// Usamos una variable global para mantener la conexión viva entre recargas (cacheo de conexión)
// esto es vital en entornos serverless como Vercel.
let client;

const getRedisClient = async () => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        // Estas opciones ayudan en entornos serverless
        connectTimeout: 10000, 
        tls: process.env.REDIS_URL.startsWith('rediss://') // Detecta si requiere SSL
      }
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
  }
  
  // Si el cliente existe pero se cerró, reconectar
  if (!client.isOpen) {
    await client.connect();
  }
  
  return client;
};

export default async function handler(request, response) {
  // --- CORS (Para que tu React pueda hablar con esto) ---
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // --- Lógica de la API ---
  const { user } = request.method === 'GET' ? request.query : request.body;

  if (!user) {
    return response.status(400).json({ error: 'Usuario requerido' });
  }

  const key = `expense_tracker:${user}`;

  try {
    // Obtenemos el cliente conectado
    const redis = await getRedisClient();

    if (request.method === 'POST') {
      const { cards, otherExpenses } = request.body;
      // Guardamos como string
      await redis.set(key, JSON.stringify({ cards, otherExpenses }));
      return response.status(200).json({ success: true });

    } else if (request.method === 'GET') {
      const data = await redis.get(key);
      // Si no hay datos, devolvemos estructura vacía
      return response.status(200).json(data ? JSON.parse(data) : { cards: [], otherExpenses: [] });
    }

  } catch (error) {
    console.error("Error en API:", error);
    return response.status(500).json({ error: error.message });
  }
}