create database foodland;
use foodland;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    endereco VARCHAR(255) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    numero VARCHAR(10) NOT NULL
);

-- Tabela de Produtos
CREATE TABLE Produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    preco DECIMAL(10, 2) NOT NULL
);

-- Tabela de Relação entre Restaurantes e Produtos
CREATE TABLE EmpresaProdutos (
    empresaId INT NOT NULL,
    produtoId INT NOT NULL,
    PRIMARY KEY (empresaId, produtoId),
    FOREIGN KEY (empresaId) REFERENCES empresas(id),
    FOREIGN KEY (produtoId) REFERENCES produtos(id)
);

-- Tabela de Pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    empresaId INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (empresaId) REFERENCES empresas(id)
);

-- Tabela de Produtos em Pedidos
CREATE TABLE pedidoItens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedidoId INT NOT NULL,
    produtoId INT NOT NULL,
    quantidade INT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedidoId) REFERENCES pedidos(id),
    FOREIGN KEY (produtoId) REFERENCES produtos(id)
);

-- Tabela de Restaurantes Favoritos dos Usuários
CREATE TABLE FavoritaEmpresa (
    userId INT NOT NULL,
    empresaId INT NOT NULL,
    PRIMARY KEY (userId, empresaId),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (empresaId) REFERENCES empresas(id)
);

-- Tabela de Carrinho de Compras
CREATE TABLE Carrinho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    produtoId INT NOT NULL,
	empresaId INT NOT NULL,
    quantidade INT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (produtoId) REFERENCES produtos(id),
	FOREIGN KEY (empresaId) REFERENCES empresas(id)
);
