const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Produto = sequelize.define('Produto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
  
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'Produtos',
  timestamps: false 
});

Produto.associate = (models) => {
    Produto.belongsToMany(models.Empresa, {
        through: models.EmpresaProdutos,
        foreignKey: "produtoId",
    });
};

module.exports = Produto;
