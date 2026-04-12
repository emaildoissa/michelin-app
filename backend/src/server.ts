import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Helper: converte row do banco (snake_case) para o formato
// que o frontend espera (camelCase)
// ============================================================
function clienteToFrontend(row: any) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    endereco: row.endereco,
  };
}

function veiculoToFrontend(row: any) {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    marca: row.marca,
    modelo: row.modelo,
    ano: row.ano,
    placa: row.placa,
    cor: row.cor,
    quilometragem: row.quilometragem,
  };
}

function servicoToFrontend(row: any) {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    valor: parseFloat(row.valor),
    tempoEstimado: row.tempo_estimado ? `${row.tempo_estimado} min` : '',
  };
}

function pecaToFrontend(row: any) {
  return {
    id: row.id,
    nome: row.nome,
    codigo: row.codigo,
    marca: row.marca,
    modeloCompativel: row.modelo_compativel,
    quantidade: row.quantidade,
    preco: parseFloat(row.preco),
  };
}

async function ordemToFrontend(row: any): Promise<any> {
  // Buscar serviços vinculados
  const servicosRes = await pool.query(
    'SELECT servico_id FROM ordem_servico_servicos WHERE ordem_id = $1',
    [row.id]
  );
  const servicosIds = servicosRes.rows.map((r: any) => r.servico_id);

  // Buscar peças vinculadas
  const pecasRes = await pool.query(
    'SELECT peca_id FROM ordem_servico_pecas WHERE ordem_id = $1',
    [row.id]
  );
  const pecasIds = pecasRes.rows.map((r: any) => r.peca_id);

  return {
    id: row.id,
    veiculoId: row.veiculo_id,
    dataEntrada: row.data_abertura,
    dataSaida: row.data_conclusao,
    status: row.status,
    descricao: row.descricao_problema || row.observacoes || '',
    servicosIds,
    pecasIds,
    valorTotal: parseFloat(row.valor_total || 0),
  };
}

// ============================================================
// --- ROTAS DE CLIENTES ---
// ============================================================
app.get('/clientes', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY nome');
    res.json(result.rows.map(clienteToFrontend));
  } catch (error) {
    console.error('GET /clientes erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/clientes', async (req: Request, res: Response) => {
  const { nome, email, telefone, endereco } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clientes (nome, email, telefone, endereco) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, telefone, endereco]
    );
    res.status(201).json(clienteToFrontend(result.rows[0]));
  } catch (error) {
    console.error('POST /clientes erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/clientes/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, email, telefone, endereco } = req.body;
  try {
    const result = await pool.query(
      'UPDATE clientes SET nome = $1, email = $2, telefone = $3, endereco = $4 WHERE id = $5 RETURNING *',
      [nome, email, telefone, endereco, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(clienteToFrontend(result.rows[0]));
  } catch (error) {
    console.error('PUT /clientes erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/clientes/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('DELETE /clientes erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// --- ROTAS DE VEÍCULOS ---
// ============================================================
app.get('/veiculos', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM veiculos ORDER BY modelo');
    res.json(result.rows.map(veiculoToFrontend));
  } catch (error) {
    console.error('GET /veiculos erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/veiculos', async (req: Request, res: Response) => {
  // Aceita tanto camelCase (do frontend) quanto snake_case
  const clienteId = req.body.clienteId || req.body.cliente_id;
  const { marca, modelo, placa, ano, cor, quilometragem } = req.body;

  if (!clienteId) {
    return res.status(400).json({
      error: 'É necessário selecionar um cliente para cadastrar o veículo.'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO veiculos (cliente_id, marca, modelo, placa, ano, cor, quilometragem) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [clienteId, marca, modelo, placa, ano, cor || null, quilometragem || null]
    );
    res.status(201).json(veiculoToFrontend(result.rows[0]));
  } catch (error) {
    console.error('POST /veiculos erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/veiculos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const clienteId = req.body.clienteId || req.body.cliente_id;
  const { marca, modelo, placa, ano, cor, quilometragem } = req.body;
  try {
    const result = await pool.query(
      `UPDATE veiculos 
       SET cliente_id = $1, marca = $2, modelo = $3, placa = $4, ano = $5, cor = $6, quilometragem = $7 
       WHERE id = $8 RETURNING *`,
      [clienteId, marca, modelo, placa, ano, cor || null, quilometragem || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    res.json(veiculoToFrontend(result.rows[0]));
  } catch (error) {
    console.error('PUT /veiculos erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/veiculos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM veiculos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    res.json({ message: 'Veículo excluído com sucesso' });
  } catch (error) {
    console.error('DELETE /veiculos erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// --- ROTAS DE SERVIÇOS ---
// ============================================================
app.get('/servicos', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM servicos WHERE ativo = true ORDER BY nome');
    res.json(result.rows.map(servicoToFrontend));
  } catch (error) {
    console.error('GET /servicos erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/servicos', async (req: Request, res: Response) => {
  const { nome, descricao, valor, tempoEstimado } = req.body;
  // tempoEstimado vem como string "2 horas" do frontend, converter para minutos
  let tempoMinutos: number | null = null;
  if (tempoEstimado) {
    const match = tempoEstimado.match(/(\d+\.?\d*)/);
    if (match) {
      const num = parseFloat(match[1]);
      // Se contém "hora", converte para minutos
      tempoMinutos = tempoEstimado.toLowerCase().includes('hora') ? Math.round(num * 60) : Math.round(num);
    }
  }
  try {
    const result = await pool.query(
      'INSERT INTO servicos (nome, descricao, valor, tempo_estimado) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, descricao, valor, tempoMinutos]
    );
    res.status(201).json(servicoToFrontend(result.rows[0]));
  } catch (error) {
    console.error('POST /servicos erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/servicos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, descricao, valor, tempoEstimado } = req.body;
  let tempoMinutos: number | null = null;
  if (tempoEstimado) {
    const match = tempoEstimado.match(/(\d+\.?\d*)/);
    if (match) {
      const num = parseFloat(match[1]);
      tempoMinutos = tempoEstimado.toLowerCase().includes('hora') ? Math.round(num * 60) : Math.round(num);
    }
  }
  try {
    const result = await pool.query(
      'UPDATE servicos SET nome = $1, descricao = $2, valor = $3, tempo_estimado = $4 WHERE id = $5 RETURNING *',
      [nome, descricao, valor, tempoMinutos, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    res.json(servicoToFrontend(result.rows[0]));
  } catch (error) {
    console.error('PUT /servicos erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/servicos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Soft delete - marca como inativo
    const result = await pool.query(
      'UPDATE servicos SET ativo = false WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    res.json({ message: 'Serviço excluído com sucesso' });
  } catch (error) {
    console.error('DELETE /servicos erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// --- ROTAS DE PEÇAS ---
// ============================================================
app.get('/pecas', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM pecas WHERE ativo = true ORDER BY nome');
    res.json(result.rows.map(pecaToFrontend));
  } catch (error) {
    console.error('GET /pecas erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/pecas', async (req: Request, res: Response) => {
  const { nome, codigo, marca, preco, quantidade, modeloCompativel } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO pecas (nome, codigo, marca, preco, quantidade, modelo_compativel) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nome, codigo, marca, preco, quantidade || 0, modeloCompativel || null]
    );
    res.status(201).json(pecaToFrontend(result.rows[0]));
  } catch (error) {
    console.error('POST /pecas erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/pecas/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, codigo, marca, preco, quantidade, modeloCompativel } = req.body;
  try {
    const result = await pool.query(
      `UPDATE pecas SET nome = $1, codigo = $2, marca = $3, preco = $4, quantidade = $5, modelo_compativel = $6 
       WHERE id = $7 RETURNING *`,
      [nome, codigo, marca, preco, quantidade, modeloCompativel || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Peça não encontrada' });
    }
    res.json(pecaToFrontend(result.rows[0]));
  } catch (error) {
    console.error('PUT /pecas erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/pecas/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE pecas SET ativo = false WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Peça não encontrada' });
    }
    res.json({ message: 'Peça excluída com sucesso' });
  } catch (error) {
    console.error('DELETE /pecas erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// --- ROTAS DE ORDENS DE SERVIÇO ---
// ============================================================
app.get('/ordens_servico', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM ordens_servico ORDER BY data_abertura DESC');
    const ordens = await Promise.all(result.rows.map(ordemToFrontend));
    res.json(ordens);
  } catch (error) {
    console.error('GET /ordens_servico erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/ordens_servico', async (req: Request, res: Response) => {
  const veiculoId = req.body.veiculoId || req.body.veiculo_id;
  const { descricao, status, valorTotal, servicosIds, pecasIds } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Inserir a ordem
    const ordemResult = await client.query(
      `INSERT INTO ordens_servico (veiculo_id, descricao_problema, status, valor_total) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [veiculoId, descricao, status || 'Aguardando aprovação', valorTotal || 0]
    );
    const ordem = ordemResult.rows[0];

    // Vincular serviços
    if (servicosIds && servicosIds.length > 0) {
      for (const servicoId of servicosIds) {
        // Buscar valor do serviço
        const servicoRes = await client.query('SELECT valor FROM servicos WHERE id = $1', [servicoId]);
        const valorServico = servicoRes.rows[0]?.valor || 0;
        await client.query(
          'INSERT INTO ordem_servico_servicos (ordem_id, servico_id, valor_unitario, valor_total) VALUES ($1, $2, $3, $3)',
          [ordem.id, servicoId, valorServico]
        );
      }
    }

    // Vincular peças
    if (pecasIds && pecasIds.length > 0) {
      for (const pecaId of pecasIds) {
        const pecaRes = await client.query('SELECT preco FROM pecas WHERE id = $1', [pecaId]);
        const valorPeca = pecaRes.rows[0]?.preco || 0;
        await client.query(
          'INSERT INTO ordem_servico_pecas (ordem_id, peca_id, valor_unitario, valor_total) VALUES ($1, $2, $3, $3)',
          [ordem.id, pecaId, valorPeca]
        );
      }
    }

    await client.query('COMMIT');
    const ordemFormatada = await ordemToFrontend(ordem);
    res.status(201).json(ordemFormatada);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('POST /ordens_servico erro:', error);
    res.status(500).json({ error: (error as Error).message });
  } finally {
    client.release();
  }
});

app.put('/ordens_servico/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const veiculoId = req.body.veiculoId || req.body.veiculo_id;
  const { descricao, status, valorTotal, servicosIds, pecasIds } = req.body;
  const dataSaida = req.body.dataSaida || req.body.data_conclusao;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Atualizar a ordem
    const ordemResult = await client.query(
      `UPDATE ordens_servico 
       SET veiculo_id = $1, descricao_problema = $2, status = $3, valor_total = $4, data_conclusao = $5
       WHERE id = $6 RETURNING *`,
      [veiculoId, descricao, status, valorTotal || 0, dataSaida || null, id]
    );

    if (ordemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    // Recriar vínculos de serviços
    await client.query('DELETE FROM ordem_servico_servicos WHERE ordem_id = $1', [id]);
    if (servicosIds && servicosIds.length > 0) {
      for (const servicoId of servicosIds) {
        const servicoRes = await client.query('SELECT valor FROM servicos WHERE id = $1', [servicoId]);
        const valorServico = servicoRes.rows[0]?.valor || 0;
        await client.query(
          'INSERT INTO ordem_servico_servicos (ordem_id, servico_id, valor_unitario, valor_total) VALUES ($1, $2, $3, $3)',
          [id, servicoId, valorServico]
        );
      }
    }

    // Recriar vínculos de peças
    await client.query('DELETE FROM ordem_servico_pecas WHERE ordem_id = $1', [id]);
    if (pecasIds && pecasIds.length > 0) {
      for (const pecaId of pecasIds) {
        const pecaRes = await client.query('SELECT preco FROM pecas WHERE id = $1', [pecaId]);
        const valorPeca = pecaRes.rows[0]?.preco || 0;
        await client.query(
          'INSERT INTO ordem_servico_pecas (ordem_id, peca_id, valor_unitario, valor_total) VALUES ($1, $2, $3, $3)',
          [id, pecaId, valorPeca]
        );
      }
    }

    await client.query('COMMIT');
    const ordemFormatada = await ordemToFrontend(ordemResult.rows[0]);
    res.json(ordemFormatada);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('PUT /ordens_servico erro:', error);
    res.status(500).json({ error: (error as Error).message });
  } finally {
    client.release();
  }
});

app.delete('/ordens_servico/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Os vínculos são deletados automaticamente via ON DELETE CASCADE
    const result = await pool.query('DELETE FROM ordens_servico WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }
    res.json({ message: 'Ordem de serviço excluída com sucesso' });
  } catch (error) {
    console.error('DELETE /ordens_servico erro:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================================
// --- UTILITÁRIOS ---
// ============================================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all 404
app.use((req: Request, res: Response) => {
  console.warn(`⚠️  Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ status: 'ERRO', message: 'Rota não encontrada', path: req.path });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Rotas disponíveis:`);
  console.log(`   GET/POST           /clientes`);
  console.log(`   PUT/DELETE         /clientes/:id`);
  console.log(`   GET/POST           /veiculos`);
  console.log(`   PUT/DELETE         /veiculos/:id`);
  console.log(`   GET/POST           /servicos`);
  console.log(`   PUT/DELETE         /servicos/:id`);
  console.log(`   GET/POST           /pecas`);
  console.log(`   PUT/DELETE         /pecas/:id`);
  console.log(`   GET/POST           /ordens_servico`);
  console.log(`   PUT/DELETE         /ordens_servico/:id`);
  console.log(`   GET                /api/health`);
});
