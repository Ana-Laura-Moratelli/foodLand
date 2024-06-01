const express = require("express");
const router = express.Router();
const { User, Empresa, EmpresaProdutos, Produto, Carrinho, Pedido, PedidoItem, FavoritaEmpresa } = require("../models");

router.post("/favoritos/adicionar", async (req, res) => {
  const { userId, empresaId } = req.body;
  try {
    // Verificar se o restaurante já está nos favoritos do usuário
    const favoritoExistente = await FavoritaEmpresa.findOne({
      where: { userId, empresaId },
    });
    if (favoritoExistente) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Restaurante já está nos favoritos.",
          alreadyAdded: true,
        });
    }

    // Adicionar restaurante aos favoritos
    await FavoritaEmpresa.create({ userId, empresaId });
    res
      .status(200)
      .json({
        success: true,
        message: "Restaurante adicionado aos favoritos com sucesso.",
      });
  } catch (error) {
    console.error("Erro ao adicionar restaurante aos favoritos:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Erro ao adicionar restaurante aos favoritos.",
      });
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/favoritos/delete/:empresaId", async (req, res) => {
  const userId = req.session.userId;
  const empresaId = req.params.empresaId;

  try {
    const favoritaEmpresa = await FavoritaEmpresa.findOne({
      where: { userId, empresaId },
    });
    if (!favoritaEmpresa) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Empresa não encontrada nos favoritos.",
        });
    }

    await favoritaEmpresa.destroy();

    res.redirect("/meusFavoritos");
  } catch (error) {
    console.error("Erro ao excluir empresa dos favoritos:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Erro ao excluir empresa dos favoritos.",
      });
  }
});

router.get("/meusProdutos", async (req, res) => {
  const empresaId = req.session.empresaId;
  try {
    const empresa = await Empresa.findByPk(empresaId, {
      include: Produto,
    });
    res.render("meusProdutos", { empresa, produtos: empresa.Produtos });
  } catch (error) {
    console.error("Erro ao obter produtos:", error);
    res.status(500).json({ success: false, error: "Erro ao obter produtos." });
  }
});

router.get("/pedidoClientes", async (req, res) => {
  const empresaId = req.session.empresaId;
  try {
    const pedidos = await Pedido.findAll({
      where: { empresaId },
      include: [
        { model: User, attributes: ["name", "email"] },
        {
          model: PedidoItem,
          as: "itens",
          include: {
            model: Produto,
            as: "produto",
            attributes: ["name", "preco"],
          },
        },
      ],
    });
    res.render("pedidoClientes", { pedidos });
  } catch (error) {
    console.error("Erro ao obter pedidos:", error);
    res.status(500).json({ success: false, error: "Erro ao obter pedidos." });
  }
});

router.post("/carrinho/delete/:id", async (req, res) => {
  const carrinhoItemId = req.params.id;
  try {
    const carrinhoItem = await Carrinho.findByPk(carrinhoItemId);
    if (!carrinhoItem) {
      return res
        .status(404)
        .json({ success: false, error: "Item do carrinho não encontrado." });
    }

    await carrinhoItem.destroy();

    res.redirect("/carrinho");
  } catch (error) {
    console.error("Erro ao excluir item do carrinho:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao excluir item do carrinho." });
  }
});

router.post("/carrinho/enviar-pedido", async (req, res) => {
  const userId = req.session.userId;

  try {
    const carrinhoItens = await Carrinho.findAll({ where: { userId } });
    if (carrinhoItens.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "Carrinho vazio. Adicione itens ao carrinho antes de enviar o pedido.",
      });
    }
    const empresaId = carrinhoItens[0].empresaId;
    for (let i = 1; i < carrinhoItens.length; i++) {
      if (carrinhoItens[i].empresaId !== empresaId) {
        return res.status(400).json({
          success: false,
          error:
            "Não é possível enviar um pedido com itens de empresas diferentes.",
        });
      }
    }

    const totalPedido = carrinhoItens.reduce(
      (total, item) => total + item.preco * item.quantidade,
      0
    );

    const novoPedido = await Pedido.create({
      userId,
      empresaId,
      total: totalPedido,
    });

    await Promise.all(
      carrinhoItens.map(async (item) => {
        await PedidoItem.create({
          pedidoId: novoPedido.id,
          empresaId: item.empresaId, 
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          preco: item.preco,
          nomeProduto: item.nomeProduto,
        });
      })
    );

    await Carrinho.destroy({ where: { userId } });

    res.redirect("/meusPedidos");
  } catch (error) {
    console.error("Erro ao enviar pedido:", error);
    res.status(500).json({ success: false, error: "Erro ao enviar pedido." });
  }
});

router.get("/meusPedidos", async (req, res) => {
  const userId = req.session.userId; 
  try {
    const pedidos = await Pedido.findAll({
      where: { userId },
      include: [
        {
          model: PedidoItem,
          as: "itens",
          include: [
            {
              model: Produto,
              as: "produto",
              attributes: ["name", "preco"],
            },
          ],
        },
      ],
    });
    res.render("meusPedidos", { pedidos });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar pedidos." });
  }
});

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

    res
      .status(200)
      .json({
        success: true,
        message: "Produto adicionado ao carrinho com sucesso.",
      });
  } catch (error) {
    console.error("Erro ao adicionar produto ao carrinho:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao adicionar produto ao carrinho.",
    });
  }
});

router.get("/homeCliente", async (req, res) => {
  try {
    const empresas = await Empresa.findAll(); 
    res.render("homeCliente", { empresas }); 
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar empresas." });
  }
});


router.get("/empresa/:id", async (req, res) => {
  const empresaId = req.params.id;
  const userId = req.session.userId; 
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

    res.render("empresaDetalhes", { empresaId, produtos, userId, empresa });
  } catch (error) {
    console.error("Erro ao buscar detalhes do restaurante:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar detalhes do restaurante.",
    });
  }
});


router.get("/registerProduct", (req, res) => {
  if (!req.session.empresaId) {
    return res.redirect("/loginEmpresa");
  }
  res.render("registerProduct");
});

router.post("/registerProduct", async (req, res) => {
  const { name, description, preco } = req.body;
  const empresaId = req.session.empresaId;

  if (!empresaId) {
    return res.status(401).json({
      success: false,
      error:
        "Você precisa estar logado como empresa para cadastrar um produto.",
    });
  }

  try {
  
    const produto = await Produto.create({ name, description, preco });
    console.log("ID da empresa na sessão:", req.session.empresaId);

    const produtoId = produto.id;

    const empresaId = req.session.empresaId;

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

router.get("/", async (req, res) => {
  try {
  
    const empresas = await Empresa.findAll();

    res.render("home", { titulo: "Home", empresas });
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    res.status(500).send("Erro ao buscar empresas.");
  }
});

router.get("/homeEmpresa", (req, res) => {
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
    req.session.empresaId = empresa.id; 

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
    req.session.userId = newUser.id; 
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return res
      .status(500)
      .json({ success: false, error: "Erro ao cadastrar usuário." });
  }
});

router.get("/homeCliente", (req, res) => {
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
  const userId = req.session.userId; 
  try {
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Usuário não autenticado." });
    }

    const carrinhoItens = await Carrinho.findAll({
      where: { userId },
      include: [{ model: Produto }], 
    });

    
    res.render("carrinho", { carrinhoItens }); 
  } catch (error) {
    console.error("Erro ao buscar itens do carrinho:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao buscar itens do carrinho." });
  }
});

router.delete("/favoritos/:empresaId", async (req, res) => {
  const userId = req.session.userId; 
  const empresaId = req.params.empresaId; 

  try {
    const user = await User.findByPk(userId);
    const empresa = await Empresa.findByPk(empresaId);

    if (!user || !empresa) {
      return res
        .status(404)
        .json({ success: false, error: "Usuário ou empresa não encontrada." });
    }
    await FavoritaEmpresa.destroy({ where: { userId, empresaId } });

    res.redirect("/meusFavoritos");
  } catch (error) {
    console.error("Erro ao remover empresa dos favoritos:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Erro ao remover empresa dos favoritos.",
      });
  }
});
router.get("/meusFavoritos", async (req, res) => {
  const userId = req.session.userId;
  try {
    const favoritos = await FavoritaEmpresa.findAll({ where: { userId } });
    const empresaIds = favoritos.map((favorito) => favorito.empresaId);

    const restaurantesFavoritos = await Empresa.findAll({
      where: { id: empresaIds },
    });

    res.render("meusFavoritos", { restaurantesFavoritos });
  } catch (error) {
    console.error("Erro ao obter restaurantes favoritos:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao obter restaurantes favoritos." });
  }
});

module.exports = router;
