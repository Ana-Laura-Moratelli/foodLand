const Empresa = require('../models/empresa');
const Produto = require('../models/produto');
const EmpresaProdutos = require('../models/EmpresaProdutos');

Empresa.belongsToMany(Produto, { through: EmpresaProdutos, foreignKey: 'empresaId' });
Produto.belongsToMany(Empresa, { through: EmpresaProdutos, foreignKey: 'produtoId' });
