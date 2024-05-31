const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { Empresa } = require("../models");
const { EmpresaProdutos } = require("../models");
const { Produto } = require("../models"); // Ajuste o caminho conforme necessário
const { Carrinho } = require("../models"); // Ajuste o caminho conforme necessário
const { Pedido } = require("../models"); // Ajuste o caminho conforme necessário
const { PedidoItem } = require("../models"); // Ajuste o caminho conforme necessário
const { FavoritaEmpresa } = require('../models/');

router.post('/favoritos/adicionar', async (req, res) => {
  const { userId, empresaId } = req.body;
  try {
      // Verificar se o restaurante já está nos favoritos do usuário
      const favoritoExistente = await FavoritaEmpresa.findOne({ where: { userId, empresaId } });
      if (favoritoExistente) {
          return res.status(400).json({ success: false, error: 'Restaurante já está nos favoritos.' });
      }

      // Adicionar restaurante aos favoritos
      await FavoritaEmpresa.create({ userId, empresaId });
      res.status(200).json({ success: true, message: 'Restaurante adicionado aos favoritos com sucesso.' });
  } catch (error) {
      console.error('Erro ao adicionar restaurante aos favoritos:', error);
      res.status(500).json({ success: false, error: 'Erro ao adicionar restaurante aos favoritos.' });
  }
});
// Rota para renderizar a página de login
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/favoritos/delete/:empresaId", async (req, res) => {
  const userId = req.session.userId; // Obtém o ID do usuário da sessão
  const empresaId = req.params.empresaId; // Obtém o ID da empresa a ser removida dos favoritos

  try {
    // Verifica se a empresa está nos favoritos do usuário
    const favoritaEmpresa = await FavoritaEmpresa.findOne({ where: { userId, empresaId } });
    if (!favoritaEmpresa) {
      return res
        .status(404)
        .json({ success: false, error: "Empresa não encontrada nos favoritos." });
    }

    // Remove a empresa dos favoritos do usuário
    await favoritaEmpresa.destroy();

    // Redireciona de volta para a página de favoritos
    res.redirect("/meusFavoritos");
  } catch (error) {
    console.error("Erro ao excluir empresa dos favoritos:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao excluir empresa dos favoritos." });
  }
});
router.get('/meusProdutos', async (req, res) => {
  const empresaId = req.session.empresaId; // Assume que a ID da empresa está na sessão
  try {
    const empresa = await Empresa.findByPk(empresaId, {
      include: Produto
    });
    res.render('meusProdutos', { empresa, produtos: empresa.Produtos });
  } catch (error) {
    console.error("Erro ao obter produtos:", error);
    res.status(500).json({ success: false, error: "Erro ao obter produtos." });
  }
});

router.get('/pedidoClientes', async (req, res) => {
  const empresaId = req.session.empresaId; // Assumindo que você está armazenando o ID da empresa na sessão
  try {
      const pedidos = await Pedido.findAll({
          where: { empresaId },
          include: [
              { model: User, attributes: ['name', 'email'] },
              { model: Empresa, attributes: ['name'] }
          ]
      });
      res.render('pedidoClientes', { pedidos });
  } catch (error) {
      console.error('Erro ao obter pedidos:', error);
      res.status(500).json({ success: false, error: 'Erro ao obter pedidos.' });
  }
});




router.post("/carrinho/enviar-pedido", async (req, res) => {
  const userId = req.session.userId; // Obtém o ID do usuário da sessão

  try {
    // Verifique se há itens no carrinho associados ao usuário
    const carrinhoItems = await Carrinho.findAll({ where: { userId } });
    if (carrinhoItems.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "Carrinho vazio. Adicione itens ao carrinho antes de enviar o pedido.",
      });
    }

    // Verifique se todos os itens do carrinho pertencem à mesma empresa
    const empresaId = carrinhoItems[0].empresaId;
    for (let i = 1; i < carrinhoItems.length; i++) {
      if (carrinhoItems[i].empresaId !== empresaId) {
        return res.status(400).json({
          success: false,
          error:
            "Não é possível enviar um pedido com itens de empresas diferentes.",
        });
      }
    }

   // Calcular o total do pedido
const totalPedido = carrinhoItems.reduce(
  (total, item) => total + (item.preco * item.quantidade),
  0
);


    // Criar o pedido com as informações do carrinho
    const novoPedido = await Pedido.create({
      userId,
      empresaId,
      total: totalPedido,
    });

    // Associar os itens do carrinho ao pedido
    await Promise.all(
      carrinhoItems.map(async (item) => {
        await PedidoItem.create({
          pedidoId: novoPedido.id,
          empresaId: item.empresaId, // Utilizar o empresaId de cada item
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          preco: item.preco,
          nomeProduto: item.nomeProduto,
        });
      })
    );

    // Limpar o carrinho do usuário após o pedido ser enviado
    await Carrinho.destroy({ where: { userId } });

    // Redirecionar para a página "Meus Pedidos"
    res.redirect("/meusPedidos");
  } catch (error) {
    console.error("Erro ao enviar pedido:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao enviar pedido." });
  }
});



router.get("/meusPedidos", async (req, res) => {
  const userId = req.session.userId; // Obtém o ID do usuário da sessão
  try {
    // Aqui você pode recuperar os pedidos associados ao usuário
    // Por exemplo, se você tiver um modelo Pedido, pode usar o método findAll para recuperar os pedidos do usuário

    // Supondo que você tenha uma lógica para recuperar os pedidos do usuário
    const pedidos = await Pedido.findAll({ where: { userId } });

    // Renderize a página "Meus Pedidos" com a lista de pedidos
    res.render("meusPedidos", { pedidos });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar pedidos." });
  }
});

// Rota para processar o login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: "Usuário não encontrado." });
    }
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: "Senha incorreta." });
    }
    // Armazena o ID do usuário na sessão
    req.session.userId = user.id;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erro ao fazer login." });
  }
});



router.post("/carrinho/add", async (req, res) => {
  const { produtoId, userId, quantidade, empresaId } = req.body;
  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res
        .status(404)
        .json({ success: false, error: "Produto não encontrado." });
    }

    const precoTotal = produto.preco * quantidade;

    await Carrinho.create({
      userId,
      produtoId,
      quantidade,
      nomeProduto: produto.name,
      preco: precoTotal,
      empresaId,
    });

    res.redirect(`/empresa/${empresaId}`);
  } catch (error) {
    console.error("Erro ao adicionar produto ao carrinho:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Erro ao adicionar produto ao carrinho.",
      });
  }
});

router.get("/homeCliente", async (req, res) => {
  try {
    const empresas = await Empresa.findAll(); // Buscar todas as empresas do banco de dados
    res.render("homeCliente", { empresas }); // Renderizar a view e passar as empresas
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar empresas." });
  }
});

// Rota para buscar detalhes de um restaurante específico
router.get("/empresa/:id", async (req, res) => {
  const empresaId = req.params.id;
  const userId = req.session.userId; // Obtém o userId da sessão
  try {
    const empresa = await Empresa.findByPk(empresaId);
    if (!empresa) {
      return res
        .status(404)
        .json({ success: false, error: "Restaurante não encontrado." });
    }

    const empresaProdutos = await EmpresaProdutos.findAll({
      where: { empresaId },
      attributes: ["produtoId"],
    });

    const produtoIds = empresaProdutos.map((ep) => ep.produtoId);

    const produtos = await Produto.findAll({
      where: { id: produtoIds },
    });

    // Passar userId para a view
    res.render("empresaDetalhes", { empresaId, produtos, userId, empresa });
  } catch (error) {
    console.error("Erro ao buscar detalhes do restaurante:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Erro ao buscar detalhes do restaurante.",
      });
  }
});

// Rota para renderizar o formulário de cadastro de produtos
router.get("/registerProduct", (req, res) => {
  if (!req.session.empresaId) {
    return res.redirect("/loginEmpresa");
  }
  res.render("registerProduct");
});

// Processa o cadastro de produtos (sem middleware)
router.post("/registerProduct", async (req, res) => {
  const { name, description, preco } = req.body;
  const empresaId = req.session.empresaId;

  if (!empresaId) {
    return res
      .status(401)
      .json({
        success: false,
        error:
          "Você precisa estar logado como empresa para cadastrar um produto.",
      });
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

    res
      .status(200)
      .json({ success: true, message: "Produto cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao cadastrar produto." });
  }
});

router.get("/", (req, res) => {
  res.render("home", { titulo: "Home" });
});

router.get("/homeEmpresa", (req, res) => {
  // Verifica se o usuário está autenticado
  if (!req.session.empresaId) {
    return res.redirect("/loginEmpresa");
  }
  res.render("homeEmpresa");
});

router.get("/loginEmpresa", (req, res) => {
  res.render("loginEmpresa");
});

router.post("/loginEmpresa", async (req, res) => {
  const { email, password } = req.body;
  try {
    const empresa = await Empresa.findOne({ where: { email } });
    if (!empresa) {
      return res
        .status(400)
        .json({ success: false, error: "Email não cadastrado." });
    }
    const isMatch = await empresa.validPassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: "Senha incorreta." });
    }
    // Defina a sessão da empresa aqui, se necessário
    req.session.empresaId = empresa.id; // Corrigido para empresaId

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao fazer login da empresa:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erro ao fazer login." });
  }
});

router.get("/registerEmpresa", (req, res) => {
  res.render("registerEmpresa");
});

router.post("/registerEmpresa", async (req, res) => {
  const { name, email, password, cnpj, endereco, cep, numero } = req.body;
  try {
    const existingEmpresa = await Empresa.findOne({ where: { email } });
    if (existingEmpresa) {
      return res
        .status(400)
        .json({ success: false, error: "Email já cadastrado." });
    }

    const newEmpresa = await Empresa.create({
      name,
      email,
      password,
      cnpj,
      endereco,
      cep,
      numero,
    });
    // Não estou definindo a sessão aqui porque geralmente não se faz login automático após o cadastro de uma empresa

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erroo ao cadastrar empresa." });
  }
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email já cadastrado." });
    }
    const newUser = await User.create({ name, email, password });
    req.session.userId = newUser.id; // Assuming you want to log in the user automatically after registration
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erro ao cadastrar usuário." });
  }
});

router.get("/homeCliente", (req, res) => {
  // Verifica se o usuário está autenticado
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  res.render("homeCliente");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

router.get("/carrinho", async (req, res) => {
  const userId = req.session.userId; // Obtém o userId da sessão
  try {
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    // Recupere os itens do carrinho associados ao usuário atual
    const carrinhoItems = await Carrinho.findAll({
      where: { userId },
      include: [{ model: Produto }], // Inclua o modelo de Produto para acessar as informações do produto
    });

    // Renderize a página do carrinho com os itens do carrinho
    res.render("carrinho", { carrinhoItems }); // Passar carrinhoItems para o modelo EJS
  } catch (error) {
    console.error("Erro ao buscar itens do carrinho:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao buscar itens do carrinho." });
  }
});
// Rota para deletar uma empresa dos favoritos
router.delete('/favoritos/:empresaId', async (req, res) => {
  const userId = req.session.userId; // Obtém o ID do usuário da sessão
  const empresaId = req.params.empresaId; // Obtém o ID da empresa a ser removida dos favoritos

  try {
      // Verifica se o usuário e a empresa existem
      const user = await User.findByPk(userId);
      const empresa = await Empresa.findByPk(empresaId);

      if (!user || !empresa) {
          return res.status(404).json({ success: false, error: 'Usuário ou empresa não encontrada.' });
      }

      // Remove a empresa dos favoritos do usuário
      await FavoritaEmpresa.destroy({ where: { userId, empresaId } });

      // Redireciona de volta para a página Meus Favoritos
      res.redirect('/meusFavoritos');
  } catch (error) {
      console.error('Erro ao remover empresa dos favoritos:', error);
      res.status(500).json({ success: false, error: 'Erro ao remover empresa dos favoritos.' });
  }
});
router.get('/meusFavoritos', async (req, res) => {
  const userId = req.session.userId; // Obtém o ID do usuário da sessão
  try {
      // Buscar os IDs das empresas favoritas do usuário
      const favoritos = await FavoritaEmpresa.findAll({ where: { userId } });
      const empresaIds = favoritos.map(favorito => favorito.empresaId);

      // Buscar informações dos restaurantes favoritos
      const restaurantesFavoritos = await Empresa.findAll({ where: { id: empresaIds } });

      res.render('meusFavoritos', { restaurantesFavoritos });
  } catch (error) {
      console.error('Erro ao obter restaurantes favoritos:', error);
      res.status(500).json({ success: false, error: 'Erro ao obter restaurantes favoritos.' });
  }
});
module.exports = router;
