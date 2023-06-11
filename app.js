var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var db = require("./models");
db.sequelize.sync({ force: false}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var signupRouter = require('./routes/signup');
var loginRouter = require('./routes/login');

var itemRouter = require('./routes/item');
var itemsRouter = require('./routes/items');

var categoryRouter = require('./routes/category');
var categoriesRouter = require('./routes/categories')

var setupRouter = require('./routes/setup')
var searchRouter = require('./routes/search');

var cartRouter = require('./routes/cart');
var allcartsRouter = require('./routes/allcarts');
var cartItemRouter = require('./routes/cartitem');

var orderRouter = require('./routes/order');
var ordersRouter = require('./routes/orders');
var allOrdersRouter = require('./routes/allorders');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/signup', signupRouter);
app.use('/login', loginRouter);

app.use('/items', itemsRouter);
app.use('/item', itemRouter);

app.use('/category', categoryRouter);
app.use('/categories', categoriesRouter);

app.use('/setup', setupRouter);


app.use('/order', orderRouter);
app.use('/orders', ordersRouter);
app.use('/allorders', allOrdersRouter);

app.use('/cart', cartRouter);
app.use('/allcarts', allcartsRouter);
app.use('/cart_item', cartItemRouter);

app.use('/search', searchRouter);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
