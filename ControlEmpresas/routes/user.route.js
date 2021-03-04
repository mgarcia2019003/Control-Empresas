'use strict'

var express = require('express')
var userController = require('../controllers/user.controller')
var mdAuth = require('../middlewares/authenticated')

var api = express.Router();

api.get('/prueba',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],userController.prueba);
api.post('/saveUser', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin],userController.saveUser);
api.post('/login', userController.login);
api.put('/updateUser/:id',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.updateUser);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.getUsers);
api.delete('/removeUser/:id',mdAuth.ensureAuth, userController.removeUser);
api.get('/reportePDF/:id', mdAuth.ensureAuth, userController.reportePDF);


module.exports = api;