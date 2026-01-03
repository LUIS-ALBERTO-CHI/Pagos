import { createClient } from 'redis';

// Variable global para mantener la conexión viva entre hot-reloads
let client;

export default async function handler(request, response) {
  // 1. Log para saber si la función se ejecuta
  console.log("--> INICIO: Recibida petición en /api/expenses");

  // Configuración CORS
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

  const { user } = request.method === 'GET' ? request.query : request.body;

  if (!user) {
    console.error("--> ERROR: Falta usuario");
    return response.status(400).json({ error: 'Usuario requerido' });
  }

  const key = `expense_tracker:${user}`;

  try {
    // Inicialización del cliente (Si no existe)
    if (!client) {
      console.log("--> REDIS: Creando nuevo cliente...");
      
      client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          // ESTO ES LO QUE ARREGLA EL ERROR DE CONEXIÓN EN VERCEL
          family: 4, 
          connectTimeout: 10000, // 10 segundos timeout
          tls: process.env.REDIS_URL && process.env.REDIS_URL.startsWith('rediss://')
        }
      });

      client.on('error', (err) => console.error('--> REDIS ERROR (Evento):', err));
    }

    // Conexión
    if (!client.isOpen) {
      console.log("--> REDIS: Conectando...");
      await client.connect();
      console.log("--> REDIS: ¡Conectado con éxito!");
    }

    // Lógica de Negocio
    if (request.method === 'POST') {
      const { cards, otherExpenses } = request.body;
      await client.set(key, JSON.stringify({ cards, otherExpenses }));
      console.log("--> ÉXITO: Datos guardados");
      return response.status(200).json({ success: true });
    } else if (request.method === 'GET') {
      const data = await client.get(key);
      console.log("--> ÉXITO: Datos leídos");
      return response.status(200).json(data ? JSON.parse(data) : { cards: [], otherExpenses: [] });
    }

  } catch (error) {
    // Capturamos cualquier error y lo imprimimos
    console.error("--> ERROR CRÍTICO EN API:", error);
    return response.status(500).json({ 
      error: 'Error interno del servidor', 
      details: error.message 
    });
  }
}