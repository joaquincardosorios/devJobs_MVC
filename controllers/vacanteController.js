const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')

exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante'
    })
}

// Agrega las vacantes a la DB
exports.agregarVacante = async (req,res) => {
    const vacante = new Vacante(req.body)

    // Crear arreglo de skills
    vacante.skills = req.body.skills.split(',')
    
    // Almacenarlo en la DB
    const nuevaVacante = await vacante.save()

    // Redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)
}

// Mostrar una vacante
exports.mostrarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({ url: req.params.url })
    // Si no hay resultados, siguiente Middleware
    if(!vacante) return next()
    res.render('vacante',{
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({ url: req.params.url })
    // Si no hay resultados, siguiente Middleware
    if(!vacante) return next()
    res.render('editar-vacante',{
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`
    })
}