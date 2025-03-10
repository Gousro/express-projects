const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin}= require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao registrar as categorias.')
        console.log('Houve um erro ao registrar as categorias.\nError: ' + error)
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome inválido' })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug inválido' })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: 'Nome da categoria é muito pequeno.' })
    }
    if (req.body.slug.length < 2) {
        erros.push({ texto: 'Slug da categoria é muito pequeno.' })
    }
    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso.')
            res.redirect('/admin/categorias')
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente.')
            console.log('Houve um erro ao salvar a categoria, tente novamente.\nError: ' + error)
            res.redirect('/admin')
        })
    }


})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria })
    }).catch((error) => {
        req.flash('error_msg', 'Essa categoria não existe.')
        console.log('Essa categoria não existe.\nError: ' + error)
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso.')
            res.redirect('/admin/categorias')
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria.')
            console.log('Houve um erro interno ao salvar a edição da categoria.\nError: ' + error)
            res.redirect('/admin/categorias')
        })
    }).catch((error) => {
        req.flash('error_msg', 'Não foi possivel editar essa categoria, tente novamente.')
        console.log('Não foi possivel editar essa categoria, tente novamente.\nError: ' + error)
        req.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso.')
        res.redirect('/admin/categorias')
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria.')
        console.log('Houve um erro ao deletar a categoria.\nError: ' + error)
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens.')
        console.log('Houve um erro ao listar as postagens.\nError: ' + error)
        res.redirect('/admin')
    })
})

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário.')
        console.log('Houve um erro ao carregar o formulário.\nError: ' + error)
        res.redirect('/admin')
    })

})

router.post('/postagens/nova', eAdmin, (req, res) => {
    var erros = [];

    if(req.body.categoria == "0"){
        erros.push({texto: 'Categoria inválida, registre uma categoria.'})
    }
    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso.')
            res.redirect('/admin/postagens')
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro ao salvar a postagem.')
            console.log('Houve um erro ao salvar a postagem.\nError: ' + error)
            res.redirect('/admin/postagens')
        })
    }

})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).then((postagem) => {

        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro ao carregar a categoria.')
            console.log('Houve um erro ao carregar a categoria.\nError: ' + error)
            res.redirect('/admin/postagens')
        })

    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição.')
        console.log('Houve um erro ao carregar o formulário de edição.\nError: ' + error)
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso.')
            res.redirect('/admin/postagens')
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao salvar a postagem.')
            console.log('Erro ao salvar a postagem.\nError:' + error)
            res.redirect('/admin/postagens')
        })
    }).catch((error) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição.")
        console.log('Houve um erro ao salvar a edição.\nError: ' + error)
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/deletar', eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso.')
        res.redirect('/admin/postagens')
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao deletar a postagem.')
        console.log('Houve um erro ao deletar a postagem.\nError: ' + error)
        res.redirect('/admin/postagens')
    })
})

module.exports = router