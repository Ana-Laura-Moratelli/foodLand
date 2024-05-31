// pedidoItens.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Produto = require('./produto');
const Pedido = require('./pedido');

const PedidoItem = sequelize.define('PedidoItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    pedidoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    produtoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    preco: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: 'pedidoItens',
    timestamps: false
});

PedidoItem.belongsTo(Produto, { foreignKey: 'produtoId' });
PedidoItem.belongsTo(Pedido, { foreignKey: 'pedidoId' });

module.exports = PedidoItem;
