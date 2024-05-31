const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Produto = require('./produto');

const Carrinho = sequelize.define('Carrinho', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    produtoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Produto,
            key: 'id'
        }
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'Carrinho',
    timestamps: false
});

Carrinho.belongsTo(Produto, { foreignKey: 'produtoId' });

module.exports = Carrinho;
