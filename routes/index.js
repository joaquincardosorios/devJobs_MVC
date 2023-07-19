const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController')
const vacanteController = require('../controllers/vacanteController')

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos)

    // Crear Vacantes
    router.get('/vacantes/nueva', vacanteController.formularioNuevaVacante)
    router.post('/vacantes/nueva', vacanteController.agregarVacante)
    return router;
}