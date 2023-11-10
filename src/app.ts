import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import path from "path";
import artistRoutes from "./routes/artist";
import authRoutes from "./routes/auth";
import buskingRoutes from "./routes/busking";
import memberRoutes from "./routes/member";
import reportRoutes from "./routes/report";
import userRoutes from "./routes/user";
import { authenticateToken } from "./utils/authenticateToken";


const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static(path.join(__dirname, 'DB', 'Images')));

app.use("/auth", authRoutes);
app.use("/users", authenticateToken, userRoutes);
app.use("/artists", authenticateToken, artistRoutes);
app.use("/buskings", authenticateToken, buskingRoutes);
app.use("/members", authenticateToken, memberRoutes);
app.use("/report", authenticateToken, reportRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the DonsNote Server!');
});

app.listen(3000, () => {
  console.log("DonsNote Server is running on port 3000");
});
