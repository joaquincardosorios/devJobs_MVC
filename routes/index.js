const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController')
const vacantesController = require('../controllers/vacanteController')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos)

    // Crear Vacantes
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    )
    router.post('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    )
    
    // Mostrar Vacante
    router.get('/vacantes/:url', vacantesController.mostrarVacante)

    // Editar vacante
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.formEditarVacante
    )
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.editarVacante
    )

    // Crear cuentas
    router.get('/crear-cuenta',usuariosController.formCrearCuenta)
    router.post('/crear-cuenta',
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    )

    // Autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion)
    router.post('/iniciar-sesion',authController.autenticarUsuario)

    // Cerrar Sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    )

    // Panel de administracion
    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel
    )

    // Editar Perdil 
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    )

    router.post('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.editarPerfil
    )
    
    return router;
}