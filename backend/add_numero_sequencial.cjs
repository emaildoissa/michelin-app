require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function up() {
  const tables = ['clientes', 'veiculos', 'servicos', 'pecas'];
  for (const table of tables) {
    try {
      await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS numero_sequencial SERIAL;`);
      console.log(`Added numero_sequencial to ${table}`);
    } catch(e) {
      console.error(`Error on ${table}:`, e.message);
    }
  }
  pool.end();
}
up();
