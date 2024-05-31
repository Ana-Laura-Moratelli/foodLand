// pedidos.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Empresa = require('./empresa');


const Pedido = sequelize.define('Pedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    empresaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    tableName: 'pedidos',
    timestamps: false
});

Pedido.belongsTo(User, { foreignKey: 'userId' });
Pedido.belongsTo(Empresa, { foreignKey: 'empresaId' });


module.exports = Pedido;
