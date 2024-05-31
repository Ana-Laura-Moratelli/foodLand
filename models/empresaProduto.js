const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Empresa = require('./empresa');
const Produto = require('./produto');


const EmpresaProdutos = sequelize.define('EmpresaProdutos', {
  empresaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,  // Parte da chave primária composta
    references: {
      model: 'empresas',
      key: 'id'
    }
  },
  produtoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,  // Parte da chave primária composta
    references: {
      model: 'produtos',
      key: 'id'
    }
  }
}, {
  tableName: 'EmpresaProdutos',
  timestamps: false // Não necessita de `createdAt` e `updatedAt`
});



Empresa.belongsToMany(Produto, { through: EmpresaProdutos, foreignKey: 'empresaId' });
Produto.belongsToMany(Empresa, { through: EmpresaProdutos, foreignKey: 'produtoId' });

module.exports = EmpresaProdutos;
