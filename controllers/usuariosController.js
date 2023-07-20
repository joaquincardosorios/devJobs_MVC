const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')
const { check, validationResult } =  require('express-validator')

exports.formCrearCuenta = (req,res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
}

exports.validarRegistro = async (req,res,next) => {
    await check('nombre').escape().notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').escape().isEmail().withMessage('El email debe ser valido').run(req)
    await check('password').escape().isLength({min:6}).withMessage('El password debe ser de al menos 6 caracteres').run(req)
    await check('confirmar').escape().notEmpty().withMessage('Confirmar password no puede ser vacio').run(req)
    await check('confirmar').escape().equals(req.body.password).withMessage('Los passwords no son iguales').run(req)

    const errores = validationResult(req).array()
    console.log(errores)
    if(errores.length){
        req.flash('error', errores.map( error => error.msg))
        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash()
        })
        return
    }
    next()

}

exports.crearUsuario = async (req,res,next) => {
    const usuario = new Usuarios(req.body)

    try {
        await usuario.save()
        res.redirect('/iniciar-sesion')
    } catch (error) {
        req.flash('error', [error])
        res.redirect('/crear-cuenta')
    }
    
}