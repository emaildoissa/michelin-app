import pg from 'pg';
import dotenv from 'dotenv';

// 1. Carregar as variáveis ANTES de qualquer outra coisa
dotenv.config();

const { Pool } = pg;

// Verificação de segurança para debug
if (!process.env.DATABASE_URL) {
  console.error("❌ ERRO: A variável DATABASE_URL não foi encontrada no .env");
}

const pool = new Pool({
  // Garante que estamos passando uma string
  connectionString: String(process.env.DATABASE_URL),
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Conexão com Supabase estabelecida com sucesso.');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool:', err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;