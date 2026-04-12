-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  cpf_cnpj VARCHAR(20) UNIQUE,
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true
);

-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS veiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  placa VARCHAR(10) UNIQUE NOT NULL,
  ano INTEGER,
  cor VARCHAR(50),
  quilometragem INTEGER,
  chassi VARCHAR(50),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10, 2) NOT NULL,
  tempo_estimado INTEGER,
  ativo BOOLEAN DEFAULT true,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Peças
CREATE TABLE IF NOT EXISTS pecas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  marca VARCHAR(100),
  modelo_compativel VARCHAR(255),
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_minima INTEGER DEFAULT 5,
  preco DECIMAL(10, 2) NOT NULL,
  localizacao VARCHAR(100),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true
);

-- Tabela de Ordens de Serviço
CREATE TABLE IF NOT EXISTS ordens_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  veiculo_id UUID NOT NULL,
  data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_conclusao TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Orçamento aprovado',
  descricao_problema TEXT,
  observacoes TEXT,
  valor_total DECIMAL(10, 2),
  mecanico_responsavel VARCHAR(255),
  FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE
);

-- Tabela de Itens da Ordem de Serviço (Serviços)
CREATE TABLE IF NOT EXISTS ordem_servico_servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ordem_id UUID NOT NULL,
  servico_id UUID NOT NULL,
  quantidade INTEGER DEFAULT 1,
  valor_unitario DECIMAL(10, 2),
  valor_total DECIMAL(10, 2),
  FOREIGN KEY (ordem_id) REFERENCES ordens_servico(id) ON DELETE CASCADE,
  FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE
);

-- Tabela de Itens da Ordem de Serviço (Peças)
CREATE TABLE IF NOT EXISTS ordem_servico_pecas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ordem_id UUID NOT NULL,
  peca_id UUID NOT NULL,
  quantidade INTEGER DEFAULT 1,
  valor_unitario DECIMAL(10, 2),
  valor_total DECIMAL(10, 2),
  FOREIGN KEY (ordem_id) REFERENCES ordens_servico(id) ON DELETE CASCADE,
  FOREIGN KEY (peca_id) REFERENCES pecas(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente_id ON veiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_veiculo_id ON ordens_servico(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_ordem_servico_servicos_ordem_id ON ordem_servico_servicos(ordem_id);
CREATE INDEX IF NOT EXISTS idx_ordem_servico_pecas_ordem_id ON ordem_servico_pecas(ordem_id);

-- Inserir dados de exemplo
INSERT INTO clientes (nome, email, telefone, celular, endereco, cidade, estado, cep) VALUES
('João Silva', 'joao@example.com', '5133334444', '51999998888', 'Rua A, 123', 'Porto Alegre', 'RS', '90000-000'),
('Maria Oliveira', 'maria@example.com', '5133335555', '51999999999', 'Rua B, 456', 'Porto Alegre', 'RS', '90001-000'),
('Carlos Santos', 'carlos@example.com', '5133336666', '51999997777', 'Rua C, 789', 'Gravataí', 'RS', '94000-000');

INSERT INTO veiculos (cliente_id, marca, modelo, placa, ano, cor, quilometragem) VALUES
((SELECT id FROM clientes WHERE nome = 'João Silva'), 'Fiat', 'Uno', 'ABC1234', 2020, 'Branco', 45000),
((SELECT id FROM clientes WHERE nome = 'Maria Oliveira'), 'Chevrolet', 'Onix', 'DEF5678', 2019, 'Preto', 62000),
((SELECT id FROM clientes WHERE nome = 'Carlos Santos'), 'Volkswagen', 'Golf', 'GHI9012', 2021, 'Prata', 32000);

INSERT INTO servicos (nome, descricao, valor, tempo_estimado) VALUES
('Troca de Óleo', 'Troca de óleo e filtro do motor', 150.00, 30),
('Alinhamento e Balanceamento', 'Alinhamento e balanceamento de rodas', 250.00, 60),
('Revisão Completa', 'Revisão completa do veículo', 500.00, 120),
('Troca de Pneus', 'Troca de pneus do veículo', 400.00, 45),
('Pastilhas de Freio', 'Troca de pastilhas de freio', 300.00, 50);

INSERT INTO pecas (codigo, nome, marca, modelo_compativel, quantidade, preco) VALUES
('OL001', 'Óleo 5W30', 'Mobil', 'Universal', 50, 35.00),
('PF001', 'Pastilha de Freio Dianteira', 'Brembo', 'Fiat Uno', 20, 120.00),
('FL001', 'Filtro de Óleo', 'Mann', 'Universal', 40, 25.00),
('PN001', 'Pneu 185/65R15', 'Michelin', 'Universal', 15, 450.00);
