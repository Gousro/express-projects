const express  = require('express')
const router   = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario  = mongoose.model('usuarios')
require('../models/Comentario')
const Comentario = mongoose.model('comentarios')
const bcrypt   = require('bcryptjs')
const passport = require('passport')
const {eAdmin}= require('../helpers/eAdmin')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido.'})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email inválido.'})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'Senha inválido.'})
    }
    if(req.body.senha.length < 6){
        erros.push({texto: 'Senha muito pequena, a senha precisa de no mínimo 6 caracteres.'})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'As senhas são diferentes, tente novamente.'})
    }
    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash('error_msg', 'Já existe uma conta com esse email no nosso sistema.')
                res.redirect('/usuarios/registro')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário.')
                            res.redirect('/')
                        }
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário criado com sucesso.')
                            res.redirect('/')
                        }).catch((error) => {
                            req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente.')
                            console.log('Houve um erro ao criar o usuário, tente novamente.\nError: ' + error)
                            res.redirect('/usuarios/registro')
                        })
                    })
                })
            }
        }).catch((error) => {
            req.flash('error_msg', 'Esse email já esta registrado no sitema.')
            console.log('Houve um erro interno.\nError: ' + error)
            res.redirect('/')
        })
    }
    
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

// router.get('/postagem/:slug/addcomentario', (req, res) => {
//     Postagem.findOne({ _slug: req.params.slug }).then((postagem) => {
//         res.render('/addcomentario', { postagem: postagem })
//     }).catch((error) => {
//         req.flash('error_msg', 'Essa postagem não existe.')
//         console.log('Essa postagem não existe.\nError: ' + error)
//         res.redirect('/addcomentario')
//     })
// })

router.post('/addcomentario', (req, res) => {
    var erros = []

    if(!req.body.conteudo || req.body.conteudo == null || typeof req.body.conteudo == undefined){
        erros.push({texto: 'Você não escreveu no conteúdo do comentário.'})
    }
    if(erros.length > 0){
        res.render('postagem/index', {erros: erros})
    }else {
        const novoComentario = {
            conteudo: req.body.conteudo
        }
        new Comentario(novoComentario).save().then(() => {
            req.flash('success_msg', 'Comentário salvo.')
            res.redirect('/postagem/index')
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro ao salvar o comentário.')
            console.log('Houve um erro ao salvar o comentário.\nError: ' + error)
            res.redirect('/postagem/index')
        })
    }
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'Deslogado.')
    res.redirect('/')
})

module.exports = router