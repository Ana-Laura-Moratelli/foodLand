const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Empresa } = require('../models');
const { EmpresaProdutos } = require('../models');
const { Produto } = require('../models'); // Ajuste o caminho conforme necessário

router.get('/homeCliente', async (req, res) => {
    try {
        const empresas = await Empresa.findAll(); // Buscar todas as empresas do banco de dados
        res.render('homeCliente', { empresas }); // Renderizar a view e passar as empresas
    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar empresas.' });
    }
});

// Rota para buscar detalhes de um restaurante específico
router.get('/empresa/:id', async (req, res) => {
    const empresaId = req.params.id;
    try {
        // Encontre a empresa pelo ID
        const empresa = await Empresa.findByPk(empresaId);
        if (!empresa) {
            return res.status(404).json({ success: false, error: 'Restaurante não encontrado.' });
        }

        // Consulta direta à tabela de associação para obter os IDs dos produtos associados à empresa
        const empresaProdutos = await EmpresaProdutos.findAll({
            where: { empresaId },
            attributes: ['produtoId']
        });
        
        // Obtenha os IDs dos produtos associados à empresa
        const produtoIds = empresaProdutos.map(ep => ep.produtoId);

        // Consulta direta à tabela de produtos para obter os detalhes dos produtos associados à empresa
        const produtos = await Produto.findAll({
            where: { id: produtoIds }
        });

        // Renderize a página com os detalhes da empresa e os produtos associados
        res.render('empresaDetalhes', { empresa, produtos });
    } catch (error) {
        console.error('Erro ao buscar detalhes do restaurante:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar detalhes do restaurante.' });
    }
});
// Rota para renderizar o formulário de cadastro de produtos
router.get('/registerProduct', (req, res) => {
    if (!req.session.empresaId) {
        return res.redirect('/loginEmpresa');
    }
    res.render('registerProduct');
});

// Processa o cadastro de produtos (sem middleware)
router.post('/registerProduct', async (req, res) => {
    const { name, description, preco } = req.body;
    const empresaId = req.session.empresaId;

    if (!empresaId) {
        return res.status(401).json({ success: false, error: 'Você precisa estar logado como empresa para cadastrar um produto.' });
    }

    try {
        // Criar o produto
        const produto = await Produto.create({ name, description, preco });
        console.log("ID da empresa na sessão:", req.session.empresaId);

        // Capturar o ID do produto criado
        const produtoId = produto.id;
    
        // Capturar o ID da empresa (supondo que você tenha o ID da empresa na sessão)
        const empresaId = req.session.empresaId;
    
        // Insere na tabela EmpresaProdutos
        await EmpresaProdutos.create({ empresaId, produtoId });
    
        res.status(200).json({ success: true, message: 'Produto cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ success: false, error: 'Erro ao cadastrar produto.' });
    }
    
    
    
});


router.get('/', (req, res) => {
    res.render('home', {titulo: 'Home'});
  });

  
  router.get('/homeEmpresa', (req, res) => {
    // Verifica se o usuário está autenticado
    if (!req.session.empresaId) {
      return res.redirect('/loginEmpresa');
    }
    res.render('homeEmpresa');
  });
  

  router.get('/loginEmpresa', (req, res) => {
    res.render('loginEmpresa');
  });

  router.post('/loginEmpresa', async (req, res) => {
    const { email, password } = req.body;
    try {
        const empresa = await Empresa.findOne({ where: { email } });
        if (!empresa) {
            return res.status(400).json({ success: false, error: 'Email não cadastrado.' });
        }
        const isMatch = await empresa.validPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Senha incorreta.' });
        }
        // Defina a sessão da empresa aqui, se necessário
        req.session.empresaId = empresa.id; // Corrigido para empresaId

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro ao fazer login da empresa:', error);
        return res.status(500).json({ success: false, error: 'Erro ao fazer login.' });
    }
});

  
  router.get('/registerEmpresa', (req, res) => {
    res.render('registerEmpresa');
  });
  
  router.post('/registerEmpresa', async (req, res) => {
    const { name, email, password, cnpj, endereco, cep, numero } = req.body;
    try {
        const existingEmpresa = await Empresa.findOne({ where: { email } });
        if (existingEmpresa) {
            return res.status(400).json({ success: false, error: 'Email já cadastrado.' });
        }
        
        const newEmpresa = await Empresa.create({ name, email, password, cnpj, endereco, cep, numero });
        // Não estou definindo a sessão aqui porque geralmente não se faz login automático após o cadastro de uma empresa

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        return res.status(500).json({ success: false, error: 'Erroo ao cadastrar empresa.' });
    }
});



router.get('/register', (req, res) => {
    res.render('register');
  });
  
  router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email já cadastrado.' });
      }
      const newUser = await User.create({ name, email, password });
      req.session.userId = newUser.id; // Assuming you want to log in the user automatically after registration
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      return res.status(500).json({ success: false, error: 'Erro ao cadastrar usuário.' });
    }
  });



// Rota para renderizar a página de login
router.get('/login', (req, res) => {
    res.render('login');
  });
  
 // Rota para processar o login
 router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ success: false, error: 'Usuário não encontrado.' });
      }
      const isMatch = await user.validPassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Senha incorreta.' });
      }
      // Armazena o ID do usuário na sessão
      req.session.userId = user.id;
  
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ success: false, error: 'Erro ao fazer login.' });
    }
  });
  
  

router.get('/homeCliente', (req, res) => {
    // Verifica se o usuário está autenticado
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    res.render('homeCliente');
  });
  

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


module.exports = router;
