const sequelize = require('../config/database');
const User = require('./user');
const Empresa = require('./empresa');
const EmpresaProdutos = require('./empresaProduto');
const Produto = require('./produto');
const Carrinho = require('./carrinho');


const db = {
  sequelize,
  Sequelize: sequelize,
  User,
  Empresa,
  EmpresaProdutos,
  Produto,
  Carrinho,
};

module.exports = db;
