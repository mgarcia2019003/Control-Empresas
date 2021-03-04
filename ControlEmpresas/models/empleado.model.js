'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var empleadoSchema = Schema({
    name: String,
    lastname: String,
    puesto: String,
    departamento: String,
})

module.exports = mongoose.model('empleado', empleadoSchema);