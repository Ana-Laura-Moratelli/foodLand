const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Empresa = require('./empresa');

const FavoritaEmpresa = sequelize.define('FavoritaEmpresa', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    empresaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Empresa,
            key: 'id'
        }
    }
}, {
    tableName: 'FavoritaEmpresa',
    timestamps: false
});

module.exports = FavoritaEmpresa;
