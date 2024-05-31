const sequelize = require('../config/database');
const User = require('./user');
const Empresa = require('./empresa');
const EmpresaProdutos = require('./empresaProduto');
const Produto = require('./produto');
const Carrinho = require('./carrinho');
const PedidoItem = require('./pedidoItens');
const Pedido = require('./pedido');
const FavoritaEmpresa = require('./favoritos');


const db = {
  sequelize,
  Sequelize: sequelize,
  User,
  Empresa,
  EmpresaProdutos,
  Produto,
  Carrinho,
  PedidoItem,
  Pedido,
  FavoritaEmpresa,
};

module.exports = db;
