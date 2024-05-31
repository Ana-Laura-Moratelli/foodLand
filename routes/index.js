const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Empresa } = require('../models');
const { EmpresaProdutos } = require('../models');
const { Produto } = require('../models'); // Ajuste o caminho conforme necessário
const { Carrinho } = require('../models'); // Ajuste o caminho conforme necessário
// Rota para renderizar a página de login
router.get('/login', (req, res) => {
  res.render('login');
});
router.post('/carrinho/delete/:id', async (req, res) => {
  const carrinhoItemId = req.params.id; // Obtém o ID do item no carrinho a ser excluído
  try {
    // Verifica se o item existe no carrinho
    const carrinhoItem = await Carrinho.findByPk(carrinhoItemId);
    if (!carrinhoItem) {
      return res.status(404).json({ success: false, error: 'Item do carrinho não encontrado.' });
    }
    
    // Remove o item do carrinho
    await carrinhoItem.destroy();

    // Redireciona de volta para a página do carrinho
    res.redirect('/carrinho');
  } catch (error) {
    console.error('Erro ao excluir item do carrinho:', error);
    res.status(500).json({ success: false, error: 'Erro ao excluir item do carrinho.' });
  }
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



router.post('/carrinho/add', async (req, res) => {
  const { produtoId, userId, quantidade, empresaId } = req.body; // Inclua empresaId aqui
  try {
      const produto = await Produto.findByPk(produtoId);
      if (!produto) {
          return res.status(404).json({ success: false, error: 'Produto não encontrado.' });
      }

      const precoTotal = produto.preco * quantidade;
      
      await Carrinho.create({
          userId,
          produtoId,
          quantidade,
          nomeProduto: produto.name, // Utilizando nomeProduto como o nome do produto
          preco: precoTotal
      });

      res.redirect(`/empresa/${empresaId}`);
  } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
      res.status(500).json({ success: false, error: 'Erro ao adicionar produto ao carrinho.' });
  }
});


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
  const userId = req.session.userId; // Obtém o userId da sessão
  try {
      const empresa = await Empresa.findByPk(empresaId);
      if (!empresa) {
          return res.status(404).json({ success: false, error: 'Restaurante não encontrado.' });
      }

      const empresaProdutos = await EmpresaProdutos.findAll({
          where: { empresaId },
          attributes: ['produtoId']
      });
      
      const produtoIds = empresaProdutos.map(ep => ep.produtoId);

      const produtos = await Produto.findAll({
          where: { id: produtoIds }
      });

      // Passar userId para a view
      res.render('empresaDetalhes', { empresa, produtos, userId });
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

router.get('/carrinho', async (req, res) => {
  const userId = req.session.userId; // Obtém o userId da sessão
  try {
      if (!userId) {
          return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
      }

      // Recupere os itens do carrinho associados ao usuário atual
      const carrinhoItems = await Carrinho.findAll({
          where: { userId },
          include: [{ model: Produto }] // Inclua o modelo de Produto para acessar as informações do produto
      });

      // Renderize a página do carrinho com os itens do carrinho
      res.render('carrinho', { carrinhoItems }); // Passar carrinhoItems para o modelo EJS
  } catch (error) {
      console.error('Erro ao buscar itens do carrinho:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar itens do carrinho.' });
  }
});



module.exports = router;
