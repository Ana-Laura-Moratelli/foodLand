const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const db = require('./models');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

const PORT = process.env.PORT || 3000;
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});
