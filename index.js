const mongoose = require('mongoose')
require('./config/db')

const express = require('express');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const path = require('path');
const router = require('./routes');
const cookierParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const createError = require('http-errors')
const passport = require('./config/passport')

require('dotenv').config({path:'variables.env'})

const app = express();

// Habilitar body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Habilitar Handlebars como views
app.engine('handlebars', 
    exphbs({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars'),
    })
);
app.set('view engine', 'handlebars');

// static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookierParser())

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection : mongoose.connection})
}))

// Inicializar passport
app.use(passport.initialize())
app.use(passport.session())

// Alertas y flash messages
app.use(flash())

// Crear nuestro middleware
app.use((req, res,next) => {
    res.locals.mensajes = req.flash()
    next()
})

// Utiliza el router sin ejecutarlo como función
app.use('/', router());

// 404 Pagiuna no existente
app.use((req,res,next) => {
    next(createError(404,'No encontrado'))
})

// Administracion de errores
app.use((error, req,res,next) => {
    res.locals.mensaje = error.message
    const status = error.status || 500
    res.locals.status = status
    res.status(status)
    res.render('error')
})

app.listen(process.env.PORT);
