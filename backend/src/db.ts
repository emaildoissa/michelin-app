import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração da conexão com PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'michelin_app',
});

// Testa a conexão ao iniciar
pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexão:', err);
});

export const query = (text: string, params?: Array<any>) => {
  return pool.query(text, params);
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default pool;
