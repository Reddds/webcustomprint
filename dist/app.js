"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
// import * as pug from 'pug';
const index_1 = __importDefault(require("./index"));
const print_1 = __importDefault(require("./print"));
const shoppinglist_1 = __importDefault(require("./shoppinglist"));
const printbyqr_1 = __importDefault(require("./printbyqr"));
const scan_1 = __importDefault(require("./scan"));
const users_1 = __importDefault(require("../routes/users"));
const app = (0, express_1.default)();
// app.engine('pug', pug.__express)
// view engine setup
app.set('views', path_1.default.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(__dirname)); // path.join(__dirname, 'public')
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/', index_1.default);
app.use('/users', users_1.default);
app.use('/shoppinglist', shoppinglist_1.default);
app.use('/printbyqr', printbyqr_1.default);
app.use('/scan', scan_1.default);
app.use('/print', print_1.default);
app.use("/bootstrap", express_1.default.static(path_1.default.join(__dirname, '../node_modules/bootstrap/dist')));
app.use("/jquery", express_1.default.static(path_1.default.join(__dirname, '../node_modules/jquery/dist')));
// catch 404 and forward to error handler
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404));
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
//# sourceMappingURL=app.js.map