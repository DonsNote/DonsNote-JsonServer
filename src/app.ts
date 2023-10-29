import express from "express";

import artistRoutes from "./routes/artist";
import authRoutes from "./routes/auth";
import buskingRoutes from "./routes/busking";
import memberRoutes from "./routes/member";
import userRoutes from "./routes/user";

const app = express();

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'DB', 'Images')));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/artists", artistRoutes);
app.use("/buskings", buskingRoutes);
app.use("/members", memberRoutes);

app.listen(3000, () => {
  console.log("DonsNote Server is running on port 3000");
});
