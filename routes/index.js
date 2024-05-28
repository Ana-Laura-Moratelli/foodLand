const express = require('express');
const router = express.Router();
const { User } = require('../models');

router.get('/register', (req, res) => {
    res.render('register');
  });
  
  router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        req.flash('error_msg', 'Email já cadastrado.');
        return res.redirect('/register');
      }
      
      const newUser = await User.create({ name, email, password });
      req.flash('success_msg', 'Cadastro realizado com sucesso!');
      res.redirect('/login');
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      req.flash('error_msg', 'Erro ao cadastrar usuário.');
      res.redirect('/register');
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
        req.flash('error_msg', 'Usuário não encontrado.');
        return res.redirect('/login');
      }
      const isMatch = await user.validPassword(password);
      if (!isMatch) {
        req.flash('error_msg', 'Senha incorreta.');
        return res.redirect('/login');
      }
      req.session.userId = user.id;
      req.flash('success_msg', 'Login realizado com sucesso!');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      req.flash('error_msg', 'Erro ao fazer login.');
      res.redirect('/login');
    }
  });
  
  

  router.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('dashboard');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
