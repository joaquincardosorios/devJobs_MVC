const mongoose = require('mongoose')
require('./config/db')

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes');
const cookierParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')

require('dotenv').config({path:'variables.env'})

const app = express();

// Habilitar body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Habilitar Handlebars como views
app.engine('handlebars', 
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
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

// Utiliza el router sin ejecutarlo como función
app.use('/', router());

app.listen(process.env.PORT);
