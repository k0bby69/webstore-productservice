const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./api/products");

const app = express();
const print = console.log;
const port = process.env.PORT || 8002;

app.use(express.json());

// Configure CORS to allow requests only from your React frontend
const corsOptions = {
  origin: ["https://webstore-frontend-9669.onrender.com", "https://webstore-userservice.onrender.com"],// Adjust this for production (e.g., https://yourfrontend.com)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // If your app needs to send cookies or authorization headers
};

app.use(cors(corsOptions));  // Use the configured CORS

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
