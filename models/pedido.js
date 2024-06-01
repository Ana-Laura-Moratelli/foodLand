const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

Pedido.associate = models => {
    Pedido.belongsTo(models.User, { foreignKey: 'userId' });
    Pedido.belongsTo(models.Empresa, { foreignKey: 'empresaId' });
    Pedido.hasMany(models.PedidoItem, { foreignKey: 'pedidoId', as: 'itens' });
};


module.exports = Pedido;
