const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./api/products");

const app = express();
const print = console.log;
const port = process.env.PORT || 8002;

app.use(express.json());

// Remove CORS restrictions and allow requests from everywhere
app.use(cors());

app.use(express.static(__dirname + "/public"));

const { CreateChannel } = require("./utils");

require("dotenv").config();
app.use(express.urlencoded({ extended: true }));

async function startApp() {
  try {
    await mongoose.connect(process.env.DB_URI);
    print("Connection sauce");

    const channel = await CreateChannel();

    await productRoutes(app, channel);
    app.listen(port, () => {
      console.log(`User Service is Listening to Port ${port}`);
    });
  } catch (err) {
    console.log("Failed to start app:", err);
  }
}

startApp();
