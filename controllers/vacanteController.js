const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const { check, validationResult } =  require('express-validator')

exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

// Agrega las vacantes a la DB
exports.agregarVacante = async (req,res) => {
    const vacante = new Vacante(req.body)

    // usuario autor de la vacante
    vacante.autor = req.user._id

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
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
    })
}

exports.editarVacante = async (req,res) => {
    const vacanteActualizada = req.body
    vacanteActualizada.skills = req.body.skills.split(',')

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada)

    res.redirect(`/vacantes/${vacante.url}`)
}

// Validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = async (req,res,next) => {
    console.log('hola')
    await check('titulo').escape().notEmpty().withMessage('Agrega un titulo a la vacante').run(req)
    await check('empresa').escape().notEmpty().withMessage('Agrega una empresa').run(req)
    await check('ubicacion').escape().notEmpty().withMessage('Agrega una ubicacion').run(req)
    await check('salario').escape().run(req)
    await check('contrato').escape().notEmpty().withMessage('Selecciona el tipo de contrato').run(req)
    await check('skills').escape().notEmpty().withMessage('Agrega al menos una habilidad').run(req)

    const errores = validationResult(req).array()
    // console.log(errores)
    if(errores.length){
        const cosa = req.flash('error', errores.map( error => error.msg))
        res.render('nueva-vacante',{
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
        return
    }
    next()

}

exports.eliminarVacante = async (req,res) => {
    const { id } = req.params

    const vacante = await Vacante.findById(id)

    if(verificarAutor(vacante, req.user)){
        vacante.deleteOne()
        res.status(200).send('Vacante Eliminada Correctamente')
    }else {
        res.status(403).send('Error')
    }
    
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)) {
        return false
    } else{
        return true
    }
}