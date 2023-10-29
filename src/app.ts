import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";

import artistRoutes from "./routes/artist";
import buskingRoutes from "./routes/busking";
import memberRoutes from "./routes/member";
import userRoutes from "./routes/user";

const app = express();

const SECRET_KEY = "your_secret_key"; // 실제 서비스에서는 안전한 방법으로 키를 저장해야 합니다.

app.use(express.json());

app.get("/generateToken", (req: Request, res: Response) => {
  const payload = {
    username: "exampleUser",
    id: 1234,
    // 여기에 필요한 다른 데이터를 추가할 수 있습니다.
  };

  const token = jwt.sign(payload, SECRET_KEY);

  res.send({ token });
});

app.use("/users", userRoutes);
app.use("/artists", artistRoutes);
app.use("/buskings", buskingRoutes);
app.use("/members", memberRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
