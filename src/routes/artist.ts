import express, { Request, Response } from "express";
import fs from 'fs';
import path from "path";
import { Artist } from "../models/artistModel";
import { User } from '../models/userModel';
import { artistValidationRules, validateArtist } from '../utils/ModelCheck/artistModelCheck';
import upload from "../utils/saveImage";

const router = express.Router();
const artistFilePath = path.join(__dirname, '..', 'DB', 'artists.json');
const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');

router.get("/", (req: Request, res: Response) => {
  // 사용자 목록 가져오기
});

router.post("/", artistValidationRules, validateArtist, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const artist: Artist = req.body;

    if (req.file) {
      artist.artistImageURL = `http://aesopos.co.kr/images/${req.file.filename}`;
    }

    const artists = JSON.parse(await fs.promises.readFile(artistFilePath, "utf8"));

    let newId = artists.length > 0 ? artists[artists.length - 1].id + 1 : 1;
    artist.id = newId;

    artists.push(artist);

    await fs.promises.writeFile(artistFilePath, JSON.stringify(artists));

    const users: User[] = JSON.parse(await fs.promises.readFile(usersFilePath, "utf8"));

    // 현재 인증된 사용자를 찾아 artistId를 업데이트합니다.
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex].artistId = newId;
      // 변경된 사용자 목록을 파일에 씁니다.
      await fs.promises.writeFile(usersFilePath, JSON.stringify(users));
    }

    res.status(201).json({ artist });
  } catch (error) {
    // 에러 처리
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  // 사용자 삭제하기
});

router.patch("/:id", (req: Request, res: Response) => {
  // 사용자 정보 수정하기
});

export default router;
