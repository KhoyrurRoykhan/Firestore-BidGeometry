import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes/routes.js";
import db from "./config/firebase.js"; // Firebase Admin SDK Firestore

dotenv.config();
const app = express();

// Firestore tidak perlu "authenticate" atau "sync" seperti Sequelize
console.log("Firestore initialized...");

app.use(cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://bidawang-geometry-app.vercel.app"
    ]
  }));
  
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));