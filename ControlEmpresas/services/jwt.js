'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptación-EMPRESAS@'

exports.createToken = (user)=>{
    var payload = {
        sub: user._id,
        name: user.name,
        username: user.lastname,
        addres: user.addres,
        role: user.role,
        iat: moment().unix(),
        expo: moment().add(1, 'hours').unix()
    }
    return jwt.encode(payload, secretKey)
}