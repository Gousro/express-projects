const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Comentario = new Schema({
  autor: {
    type: Schema.Types.ObjectId,
    ref: 'usuarios',
    required: true
  },
  conteudo: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    default: Date.now()
  }
})

mongoose.model('comentarios', Comentario)