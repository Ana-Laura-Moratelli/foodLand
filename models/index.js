const sequelize = require('../config/database');
const User = require('./user');
const Empresa = require('./empresa');
const EmpresaProdutos = require('./empresaProduto');
const Produto = require('./produto');

const db = {
  sequelize,
  Sequelize: sequelize,
  User,
  Empresa,
  EmpresaProdutos,
  Produto,
};

module.exports = db;
