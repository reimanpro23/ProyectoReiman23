const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const productoSchema = new mongoose.Schema({
  nombreProducto: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
  },
  precio: {
    type: Number,
    required: true,
    trim: true,
  },
  imagen: {
    type: String,
    required: true,
  },
  usuario:{
    type: mongoose.Types.ObjectId,
		trim: true,
		ref: 'Usuario',
  }
  
});

// usuarioSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Producto", productoSchema);