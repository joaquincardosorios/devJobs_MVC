const mongoose = require('mongoose')
require('dotenv').config({path:'variables.env'})

mongoose.connect(process.env.DB, {useNewUrlParser:true})

mongoose.connection.on('error', (error) => {
    console.log(error)
})

// Importar los modelos
require('../models/Vacantes')
require('../models/Usuarios')