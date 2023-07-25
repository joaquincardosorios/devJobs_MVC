const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')
const { check, validationResult } =  require('express-validator')
const multer = require('multer')
const shortid = require('shortid')

exports.subirImagen = (req,res,next) => {
    upload(req, res, function(error) {
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy pesado, maximo 100kb')
                } else {
                    req.flash('error', error.message)
                }
            } else {
                req.flash('error', error.menssage)
                if (error.hasOwnProperty('message')) {
                    req.flash('error', error.message)
                }
            }

            res.redirect('/administracion')
            return
        } else {
            return next();
        }
    })
}

// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,cb)=> {
            cb(null, __dirname+'../../public/uploads/perfiles')
        },
        filename : (req,file,cb) => {
            const extension = file.mimetype.split('/')[1]
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req,file,cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ){
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true)
        } else {
            cb(new Error('Formato No Valido'), false)
        }
    }
}

const upload = multer(configuracionMulter).single('imagen')


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

exports.formIniciarSesion = (req,res) => {
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar Sesion devJobs'
    })
}

// Editar Perfil
exports.formEditarPerfil = (req,res) => {
    res.render('editar-perfil',{
        nombrePagina: 'Edita tu Perfil en debJobs',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen : req.user.imagen
    })
}

exports.editarPerfil= async (req,res) => {
    const usuario = await Usuarios.findById(req.user._id)

    usuario.nombre = req.body.nombre
    usuario.email = req.body.email
    if(req.body.password){
        usuario.password = req.body.password
    }

    if(req.file){
        usuario.imagen = req.file.filename
    }

    await usuario.save()
    req.flash('correcto','Cambios guardados correctamente')
    // redirect
    res.redirect('/administracion')
}

// sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = async (req, res, next) => {
    await check('nombre').escape().notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').escape().isEmail().withMessage('El email debe ser valido').run(req)
    if(req.body.password){
        await check('password').escape().isLength({min:6}).withMessage('El password debe ser de al menos 6 caracteres').run(req)
    }

    const errores = validationResult(req).array()
    console.log(errores)

    if(errores.length){
        req.flash('error', errores.map( error => error.msg))
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu Perfil en debJobs',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash(),
            imagen : req.user.imagen
        })

        return
    }
    next()
}

