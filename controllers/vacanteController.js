const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante')
const { check, validationResult } =  require('express-validator')
const multer = require('multer')
const shortid = require('shortid')

exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen : req.user.imagen
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
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor')
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
        imagen : req.user.imagen
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
            mensajes: req.flash(),
            imagen : req.user.imagen
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

// Subir archivos en pdf
exports.subirCV = (req,res,next) => {
    upload(req, res, function(error) {
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy pesado, maximo 500kb')
                } else {
                    req.flash('error', error.message)
                }
            } else {
                req.flash('error', error.menssage)
                if (error.hasOwnProperty('message')) {
                    req.flash('error', error.message)
                }
            }

            res.redirect('back')
            return
        } else {
            return next();
        }
    })
}

// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 500000},
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,cb)=> {
            cb(null, __dirname+'../../public/uploads/cv')
        },
        filename : (req,file,cb) => {
            const extension = file.mimetype.split('/')[1]
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req,file,cb){
        if(file.mimetype === 'application/pdf'){
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true)
        } else {
            cb(new Error('Formato No Valido'), false)
        }
    }
}

const upload = multer(configuracionMulter).single('cv')

// Almacenar los candidatos en la DB
exports.contactar = async (req,res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url})

    if(!vacante) return next()

    const nuevoCandidatos = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    // almacenar la vacante
    vacante.candidatos.push(nuevoCandidatos)
    await vacante.save()

    // mensaje flash y redireccion
    req.flash('correcto', 'Se envio tu curriculum correctamente')
    res.redirect('/')
}