import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  // 사용자 목록 가져오기
});

router.post("/", (req: Request, res: Response) => {

});

router.delete("/:id", (req: Request, res: Response) => {
  // 사용자 삭제하기
});

router.patch("/:id", (req: Request, res: Response) => {
  // 사용자 정보 수정하기
});

export default router;
