'use strict'

var express = require('express');
var empleadoController = require('../controllers/empleado.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.put('/setEmpleado/:id', mdAuth.ensureAuth, empleadoController.setEmpleado);
api.put('/:idU/updateEmpleado/:idE', mdAuth.ensureAuth, empleadoController.updateEmpleado);
api.delete('/:idU/removeEmpleado/:idE', mdAuth.ensureAuth, empleadoController.removeEmpleado)
api.post('/search', mdAuth.ensureAuth , empleadoController.search);
api.get('/getEmpleados/:id', mdAuth.ensureAuth, empleadoController.getEmpleados);

module.exports = api;