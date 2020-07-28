const localStrategy = require('passport-local')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Model de usuários
require('../models/Usuario')
const usuario = mongoose.model('usuarios')


module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        usuario.findOne({email: email}).then((usuario) =>{
            if(!usuario){
                return done(null, false, {message: 'Essa conta não existe.'})
            }
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: 'Senha incorreta.'})
                }
            })
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        usuario.findById(id, (erro, usuario) => {
            done(erro, usuario)
        })
    })





}