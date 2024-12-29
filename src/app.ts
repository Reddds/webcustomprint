import createError from 'http-errors';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
// import * as pug from 'pug';

import indexRouter from "./index";
import printRouter from "./print";
import shoppinglistRouter from "./shoppinglist";
import printbyqrRouter from "./printbyqr";
import scanRouter from "./scan";
import usersRouter from "../routes/users";


const app = express();

// app.engine('pug', pug.__express)
    // view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(__dirname)); // path.join(__dirname, 'public')

// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/shoppinglist', shoppinglistRouter);
app.use('/printbyqr', printbyqrRouter);
app.use('/scan', scanRouter);
app.use('/print', printRouter);

app.use("/bootstrap", express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));
app.use("/jquery", express.static(path.join(__dirname, '../node_modules/jquery/dist')));
app.use("/js-cookie", express.static(path.join(__dirname, '../node_modules/js-cookie/dist')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;


//=============== DB Maintinance

