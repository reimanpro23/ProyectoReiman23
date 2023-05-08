const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const usuarioSchema = new mongoose.Schema({
  nombreUsuario: {
    type: String,
    required: true,
    trim: true,
    minLength: 6,
    maxLength: 50,
  },
  cif: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
  },
  password:{
    type: String,
    trim: true,
  },
  direccion: {
    type: String,
    trim: true,
  },

  productos:[ 
    {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Producto"
    }
    ],
});

usuarioSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Usuario", usuarioSchema);