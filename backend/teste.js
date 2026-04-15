import pg from 'pg';
const { Client } = pg;

const client = new Client({
    connectionString: "postgresql://postgres.uwwlivosqzmcsmluxjvh:!@vcdmsa77!@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

async function conectar() {
    try {
        console.log("Tentando conexão...");
        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log("✅ CONECTADO!");
        console.log("Hora no banco:", res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error("❌ ERRO:", err.message);
    }
}

conectar();