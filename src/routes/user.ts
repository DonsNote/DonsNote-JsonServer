import express, { Request, Response } from "express";
import { saveData } from "../utils/saveData";
import upload from "../utils/saveImage";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  // 사용자 목록 가져오기
});

router.post("/", upload.single('images'), (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
      return res.status(400).send({ message: "Please upload an image." });
  }

  const user = req.body;
  user.userImageURL = `http://54.180.143.129:3000/images/$(file.filename)`;

  const newId = saveData("users.json", user);
  res.send({ message: "User saved successfully!", id: newId });
});


router.delete("/:id", (req: Request, res: Response) => {
  // 사용자 삭제하기
});

router.patch("/:id", (req: Request, res: Response) => {
  // 사용자 정보 수정하기
});

export default router;
