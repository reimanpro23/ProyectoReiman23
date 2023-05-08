const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Gestión de las rutas
const rutasUsuarios = require('./routes/rutas-usuarios');
app.use("/api/tienda/usuarios", rutasUsuarios);

const rutasProductos = require('./routes/rutas-productos');
app.use("/api/tienda/productos", rutasProductos);


app.use((req, res) => {
  // Middleware que se ejecuta cuando el servidor no tiene la ruta que se ha enviado desde el cliente
  res.status(404);
  res.json({
    mensaje: "Información no encontrada",
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("💯 Conectado con éxito a Atlas");
    app.listen(process.env.PORT, () => console.log(`🧏‍♀️ Escuchando en puerto ${process.env.PORT}`));
  })
  .catch((error) => console.log(error));