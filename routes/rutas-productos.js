const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Producto = require("../models/modelo-producto");


// * Listar todos los productos
router.get("/", async (req, res, next) => {
  let productos;
  try {
    productos = await Producto.find({});
  } catch (err) {
    console.log(err);
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todos los productos",
    productos: productos,
  });
});


// * Buscar un producto en función del parámetro de búsqueda (solo admin)
router.get("/buscar/:busca", async (req, res, next) => {
  const search = req.params.busca;
  console.log(search);
  let productos;
  try {
    productos = await Producto.find({
          nombreProducto: { $regex: search, $options: "i" },
    });
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({ 
    mensaje: "Productos encontrados", 
    productos: productos });
});
// Crear un nuevo producto y guardarlo en Atlas
router.post('/', async (req, res, next) => {
	const nuevoProducto = new Producto({
		// Nuevo documento basado en el Model Curso.
		nombreProducto: req.body.nombreProducto,
		descripcion: req.body.descripcion,
		precio: req.body.precio,
		imagen: req.body.imagen,
    usuario: req.body.usuario,
	});
	try {
		await nuevoProducto.save(); // Guardar en MongoDB Atlas
	} catch (error) {
		console.log(error.message);
		const err = new Error('No se han podido guardar los datos');
		err.code = 500;
		return next(err);
	}
	res.status(201).json({
		mensaje: 'Producto añadido a la BDD',
		producto: nuevoProducto,
	});
});

// * Modificar un curso en base a su id
router.patch('/:id', async (req, res, next) => {
	const idProducto = req.params.id;
	let productoBuscar;
	try {
		productoBuscar = await Producto.findById(idProducto); // (1) Localizamos el curso en la BDD
	} catch (error) {
		const err = new Error(
			'Ha habido algún problema. No se ha podido actualizar la información del producto'
		);
		err.code = 500;
		throw err;
	}
	let productoSearch;
	try {
		productoSearch = await Producto.findByIdAndUpdate(idProducto, req.body, {
			new: true,
			runValidators: true,
		});
	} catch (error) {
		const err = new Error(
			'Ha ocurrido un error. No se han podido actualizar los datos'
		);
		err.code = 500;
		return next(error);
	}
	res.status(200).json({
		mensaje: 'Producto modificado',
		producto: productoSearch,
	});
});

// * Eliminar un curso en base a su id (y el docente relacionado)
router.delete("/:id", async (req, res, next) => {
  const idProducto = req.params.id;
  let producto;
  try {
    producto = await Producto.findById(idProducto); // ? Localizamos el curso en la BDD por su id
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos para eliminación"
    );
    error.code = 500;
    return next(error);
  }
  if (!producto) {
    // ? Si no se ha encontrado ningún curso lanza un mensaje de error y finaliza la ejecución del código
    const error = new Error(
      "No se ha podido encontrar un producto con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }

  // ? Si existe el curso y el usuario se ha verificado
  try {
    // ? (1) Eliminar curso de la colección
    await producto.deleteOne();
     
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    message: "Producto eliminado",
  });
});



module.exports = router;



















module.exports = router;