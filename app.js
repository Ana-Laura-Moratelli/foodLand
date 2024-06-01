const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./models'); 
const app = express();

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuração da sessão
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Configuração do flash
app.use(flash());

// Definindo o diretório de views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configuração de rotas
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Configuração de arquivos estáticos
app.use(express.static(__dirname));

// Sincronizar o banco de dados e iniciar o servidor
db.sequelize.sync()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });
