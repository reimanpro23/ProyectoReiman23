const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/modelo-usuario");


// * Crear nuevo usuario 
router.post("/", async (req, res, next) => {
  console.log("Dentro");
  const { nombreUsuario,cif, email, password, direccion, articulos,} = req.body;
  let existeUsuario;
  try {
    existeUsuario = await Usuario.findOne({
      email: email,
    });
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    console.log("email ya existe");
    return next(error);
  }

  if (existeUsuario) {
    const error = new Error("Ya existe un usuario con ese e-mail.");
    error.code = 401; // 401: fallo de autenticación
    return next(error);
  } else {
    // ? Encriptación de password mediante bcrypt y salt
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12); // ? Método que produce la encriptación
    } catch (error) {
      const err = new Error("No se ha podido crear el usuario. Inténtelo de nuevo");
      err.code = 500;
      return next(err);
    }
    console.log(hashedPassword);

    const nuevoUsuario = new Usuario({
      nombreUsuario,
      cif,
      email,
      password: hashedPassword,
      direccion,
      articulos:[],
    });
    try {
      await nuevoUsuario.save();
    } catch (error) {
      const err = new Error("No se han podido guardar los datos");
      err.code = 500;
      return next(err);
    }

// ? Código para la creación del token
try {
  token = jwt.sign(
    {
      userId: nuevoUsuario.id,
      email: nuevoUsuario.email,
    },
    "clave_supermegasecreta",
    {
      expiresIn: "1h",
    }
  );
} catch (error) {
  const err = new Error("El proceso de alta ha fallado");
  err.code = 500;
  return next(err);
}
res.status(201).json({
  userId: nuevoUsuario.id,
  email: nuevoUsuario.email,
  token: token,
});
}
});


// * Login de usuarios
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  let usuarioExiste;
  try {
    usuarioExiste = await Usuario.findOne({
      // (1) Comprobación de email
      email: email,
    });
  } catch (error) {
    const err = new Error(
      "No se ha podido realizar la operación. Pruebe más tarde"
    );
    err.code = 500;
    return next(err);
  }
  console.log(usuarioExiste);

  // ¿Qué pasa si el usuario no existe?
  if (!usuarioExiste) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales erróneos 2"
    ); // (2) El usuario no existe
    error.code = 422; // 422: Datos de usuario inválidos
    return next(error);
  }

  // Si existe el usuario, ahora toca comprobar las contraseñas.
  let esValidoElPassword = false;
  esValidoElPassword = bcrypt.compareSync(password, usuarioExiste.password);
  if (!esValidoElPassword) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales 2 erróneos"
    ); // (2) El usuario no existe
    error.code = 401; // 401: Fallo de autenticación
    return next(error);
  }
// ? Usuario con los credeciales correctos.
  // ? Creamos ahora el token
  

  let token;
  try {
    token = jwt.sign(
      {
        userId: usuarioExiste.id,
        email: usuarioExiste.email,
      },
      "clave_supermegasecreta",
      {
        expiresIn: "1h",
      }
    );
  } catch (error) {
    const err = new Error("El proceso de login ha fallado");
    err.code = 500;
    return next(err);
  }
  res.status(201).json({
    mensaje: "Usuario ha entrado con éxito en el sistema",
    userId: usuarioExiste.id,
    email: usuarioExiste.email,
    token: token,
  });
});




// * Listar un usuario en concreto
router.get("/:id", async (req, res, next) => {
  const idUsuario = req.params.id;
  let usuario;
  try {
    usuario = await Usuario.findById(idUsuario);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!usuario) {
    const error = new Error(
      "No se ha podido encontrar un usuario con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    mensaje: "Usuario encontrado",
    usuario: usuario,
  });
});

// * Listar todos los Usuarios
router.get("/", async (req, res, next) => {
  let usuarios;
  try {
    usuarios = await Usuario.find({}, "-password",);
  } catch (err) {
    console.log(err);
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todos los usuarios",
    usuarios: usuarios,
  });
});


// * Modificar datos de un usuario - Método más efectivo (findByIdAndUpadate)
router.patch("/:id", async (req, res, next) => {
  const idUsuario = req.params.id;
  const camposPorCambiar = req.body;
  let usuarioBuscar;
  try {
    usuarioBuscar = await Usuario.findByIdAndUpdate(
      idUsuario,
      camposPorCambiar,
      {
        new: true,
        runValidators: true,
      }
    ); // (1) Localizamos y actualizamos a la vez el usuario en la BDD
  } catch (error) {
    res.status(404).json({
      mensaje: "No se han podido actualizar los datos del usuario",
      error: error.message,
    });
  }
  res.status(200).json({
    mensaje: "Datos de usuario modificados",
    usuario: usuarioBuscar,
  });
});


// router.patch("/:id/carrito", async(req,res,next)=> {
//   let idUsuario = req.params.id;
//   let idProductos = req.body.id;
//   let carritoDelUsuario;
//   let elProducto;
  
//   try{
//     carritoDelUsuario = await Usuario.findById(idUsuario);
//     elProducto = await Producto.findById(idProductos);
//     carritoDelUsuario.carrito.push(elProducto);
//     await carritoDelUsuario.save();
//   }
//   catch(error) {
//     res.status(500).json({

//       mensaje : `Error en el añadir el producto en el carrito`,
//       error : error.message,
//     })
//     return next(error)
//   }
//   res.status(200).json({
//     mensaje : `Ya esta añadido en el carrito`,
//     carrito : carritoDelUsuario,
//   })
// })


// * Eliminar un usuario
router.delete("/:id", async (req, res, next) => {
  let usuario;
  try {
    usuario = await Usuario.findByIdAndDelete(req.params.id);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Usuario eliminado",
    usuario: usuario,
  });
});


// * Buscar un usuario en función del parámetro de búsqueda (solo admin)
router.get("/buscar/:busca", async (req, res, next) => {
  const search = req.params.busca;
  let usuarios;
  try {
    usuarios = await Usuario.find({
      nombreUsuario: { $regex: search, $options: "i" },
    });
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({ 
    mensaje: "Usuarios encontrados", 
    usuarios: usuarios });
});


module.exports = router;
