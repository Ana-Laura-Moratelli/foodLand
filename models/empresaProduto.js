const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Empresa = require('./empresa');
const Produto = require('./produto');


const EmpresaProdutos = sequelize.define('EmpresaProdutos', {
  empresaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true, 
    references: {
      model: 'empresas',
      key: 'id'
    }
  },
  produtoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,  
    references: {
      model: 'produtos',
      key: 'id'
    }
  }
}, {
  tableName: 'EmpresaProdutos',
  timestamps: false 
});



Empresa.belongsToMany(Produto, { through: EmpresaProdutos, foreignKey: 'empresaId' });
Produto.belongsToMany(Empresa, { through: EmpresaProdutos, foreignKey: 'produtoId' });

module.exports = EmpresaProdutos;
