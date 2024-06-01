const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const Empresa = sequelize.define(
  "Empresa",
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
  
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cnpj: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true,
    },
    endereco: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cep: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },
    numero: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    tableName: "empresas", 
    timestamps: false, 
    hooks: {
      beforeCreate: async (empresa) => {
        const salt = await bcrypt.genSalt(10);
        empresa.password = await bcrypt.hash(empresa.password, salt);
      },
    },
  }
);
Empresa.associate = (models) => {
    Empresa.belongsToMany(models.Produto, {
        through: models.EmpresaProdutos,
        foreignKey: "empresaId",
    });
};

Empresa.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Empresa;
