'use strict'

var User = require('../models/user.model')
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var pdf = require('html-pdf');


function prueba(req, res){
    res.status(200).send({message: 'Funcionando correctamente'})
}

function createInit(req, res){
    let user = new User();
    User.findOne({username: 'admin'}, (err, userFind)=>{
        if(err){
            console.log('Error al cargar el administrador');
        }else if(userFind){
            console.log('El administrador está creado')
        }else{
            user.password = "12345";
            bcrypt.hash(user.password, null, null, (err, passwordHash)=>{
                if(err){
                    res.status(500).send({message: 'Error al encriptar la contraseña'})
                }else if(passwordHash){
                    user.username = "admin";
                    user.password = passwordHash;
                    user.role = "ROLE_ADMIN"
                    user.save((err, userSave)=>{
                        if(err){
                            console.log('Error al crear al administrador')
                        }else if(userSave){
                            console.log('El administrador ha sido creado exitosamente')
                        }else{
                            console.log('El administrador no fue creado')
                        }
                    })
                }
            })
        }
    })
}

function login(req, res){
    var params = req.body;

    if(params.username && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la verificación de la contraseña'});
                    }else if(checkPassword){
                        if(params.gettoken){
                            return res.send({ token: jwt.createToken(userFind)});
                        }else{
                            return res.send({message: 'Usuario logeado'})
                        }
                    }else{
                        return res.status(404).send({message: 'Contraseña incorrecta'});
                    }
                })
            }else{
                return res.send({message: 'El usuario no fue encontrado'})
            }
        })
    }else{
        return res.status(401).send({message: 'Ingresar todos los datos'});
    }
}

function saveUser(req, res){
    var user = new User();
    var params = req.body;

    if(params.name && params.username && params.password && params.address && params.phone){
        User.findOne({username: params.username}, (err, userFind)=>{
            if(err){
                return res.send({message: 'Error general en el servidor'})
            }else if(userFind){
                return res.send({message: 'Nombre de usuario ya existente'})
            }else{
                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la encriptación'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name.toLowerCase();
                        user.username = params.username.toLowerCase();
                        user.phone = params.phone;
                        user.addres = params.address.toLowerCase();
                        user.role = "ROLE_EMPRESA";

                        user.save((err, userSaved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al guardar'});
                            }else if(userSaved){
                                return res.send({message: 'Empresa guardada', userSaved})
                            }else{
                                return res.send(500).send({message: 'No se guardó la empresa'})
                            }
                        })
                    }else{
                        return res.status(401).send({message: 'Contraseña no encriptada'})
                    }
                })
            }
        })
    }else{
        return res.send({message: 'Ingresar todos los datos'});
    }
}

function updateUser(req, res){
    let userId = req.params.id;
    let update = req.body;

    if(update.password){
        return res.status(500).send({message: 'No se puede actualizar la contraseña'});
    }else{
        if(update.username){
            User.findOne({username: update.username.toLowerCase()}, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'});
                }else if(userFind){
                    return res.send({message: 'No se puede actualizar, nombre de usuario ya existente'});
                }else{
                    User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al actualizar'});
                        }else if(userUpdated){
                            return res.send({message: 'Usuario actualizado', userUpdated});
                        }else{
                            return res.send({message: 'No se pudo actualizar al usuario'});
                        }
                    })
                }
            })
        }else{
            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al actualizar'});
                }else if(userUpdated){                        
                    return res.send({message: 'Usuario actualizado', userUpdated});
                }else{
                    return res.send({message: 'No se pudo actualizar al usuario'});
                }
            })
        }
    }
}

function getUsers(req, res){
    User.find({}).populate('empleados').exec((err, users)=>{
        if(err){
            return res.status(500).send({message: 'Error general en el servidor'})
        }else if(users){
            return res.send({message: 'Usuarios:', users})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    })
}

function removeUser(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(403).send({message: 'No tienes permiso para eliminar esta empresa'});
    }else{
        User.findOne({_id: userId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al eliminar'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al intentar eliminar'})
                    }else if(checkPassword){
                        User.findByIdAndRemove(userId, (err, userRemoved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al eliminar'});
                            }else if(userRemoved){
                                return res.send({message: 'Usuario eliminado'});
                            }else{
                                return res.status(403).send({message: 'Usuario no eliminado'});
                            }
                        })
                    }else{
                        return res.status(403).send({message: 'Contraseña incorrecta'});
                    }
                })
            }else{
                return res.status(403).send({message: 'Usuario no eliminado'});
            } 
        })
    }
}

function reportePDF(req, res){
    let userId = req.params.id;

    User.findOne({_id: userId}).populate().exec((err, userFind)=>{
        if(err){
            res.status(500).send({message: 'Error al mostrar datos'})
        }else if(userFind){
            let empleados = userFind.empleados;
            let empleadosEncontrados = [];

            empleadosEncontrados.forEach(elemento=>{

                Empleado.find({_id: elemento}).exec((err, empleadoEncontrado)=>{
                    if(err){
                        console.log(err);
                    }else if(empleadosEncontrados){
                        console.log(empleadoEncontrado);
                        empleadosEncontrados.push(empleadoEncontrado);
                    }else{
                        console.log(elemento)
                    }
                })
            })


            let content = `
                <!doctype html>
                <html>
                    <head>
                        <meta charset = "utf-8">
                        <title>Reporte de Empleados</title>
                    </head>
                    <body>
                        <table>
                            <tbody>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Puesto</th>
                                    <th>Departamento</th>
                                </tr>
                                <tr>
                                    ${empleadosEncontrados.map(empleado => `<tr><td>${empleado.name}</td></tr>`).join(``)}
                                    ${empleadosEncontrados.map(empleado => `<tr><td>${empleado.lastname}</td></tr>`).join(``)}
                                    ${empleadosEncontrados.map(empleado => `<tr><td>${empleado.puesto}</td></tr>`).join(``)}
                                    ${empleadosEncontrados.map(empleado => `<tr><td>${empleado.departamento}</td></tr>`).join(``)}
                                </tr>
                            </tbody>
                        </table>
                    </body>
                </html>
            `;
            let options = {
                paginationOffset :1,
                "header":{
                    "height": "45px",
                    "contents" : '<div style="text-align: center;">' + userFind.name + '</div>'
                }
            }
            pdf.create(content, options).toFile('./Reporte PDF '+ userFind.name + '.pdf', 
            function (err, res){
                if(err){
                    console.log(err);
                }else{
                    console.log(res);
                }
            })
            res.status(300).send({message: 'PDF creado exitosamente'})
        }else{
            res.status(404).send({message: 'No hay existe ningun empleado'})
        }
    })
}

module.exports = {
    prueba,
    saveUser,
    createInit,
    login,
    updateUser,
    getUsers,
    removeUser,
    reportePDF,
}