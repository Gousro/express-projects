// Carrendo modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const colors = require('colors')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const moment = require('moment')
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)

//Configurações
// Session
app.use(session({
    secret: 'password',
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
// Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null;
    next()
})
// Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main', helpers: { formatDate: (date) => { return moment(date).format('DD/MM/YYYY - HH:mm:ss') } } }))
app.set('view engine', 'handlebars')
// Mongoose
mongoose.connect('mongodb://localhost:27017/blogapp', { useNewUrlParser: true }).then(() => {
    console.log('Conexão com o MongoDB: ' + 'Online'.green)
}).catch((error) => {
    console.log('Conexão com o MongoDB: ' + 'Offline'.red + '\nError: ' + error)
})
// Public
app.use(express.static(path.join(__dirname, 'public')))

// Rotas
app.get('/', (req, res) => {
    Postagem.find().populate('categoria').sort({ data: 'desc' }).then((postagens) => {
        res.render('index', { postagens: postagens })
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro interno.')
        console.log('Houve um erro interno. Erro: ' + error)
        res.redirect('/404')
    })
})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
        if (postagem) {
            res.render('postagem/index', { postagem: postagem })
        } else {
            req.flash('error_msg', 'Está postagem não existe.')
            res.redirect('/')
        }
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro interno.')
        console.log('Houve um erro interno. Erro: ' + error)
        res.redirect('/')
    })
})

app.get('/categorias', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('categorias/index', { categorias: categorias })
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro interno ao listar as categorias.')
        console.log('Houve um erro interno ao listar as categorias.' + error)
        res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).then((postagens) => {
                res.render('categorias/postagens', { postagens: postagens, categoria: categoria })
            }).catch((error) => {
                req.flash('error_msg', 'Houve um erro ao listar as postagens.')
                console.log('Houve um erro ao listar as postagens.' + error)
                res.redirect('/')
            })
        } else {
            req.flash('error_msg', 'Essa categoria não existe.')
            res.redirect('/')
        }
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro interno ao carregar a página dessa categoria.')
        console.log('Houve um erro interno ao carregar a página dessa categoria. Erro: ' + error)
        res.redirect('/')
    })
})

app.get('/404', (req, res) => {
    res.send('Erro 404!')
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)
// Outros
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log('\nServidor Web: ' + 'Online'.green)
})
