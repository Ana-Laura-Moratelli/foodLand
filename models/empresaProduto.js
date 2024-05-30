const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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



module.exports = EmpresaProdutos;
