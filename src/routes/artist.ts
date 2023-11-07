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

router.get("/", async (req: Request, res: Response) => {
  try {
    const artistId = req.user?.artistId;
    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is missing from the user data." });
    }

    const artistsData = await fs.promises.readFile(artistFilePath, "utf8");
    const artists = JSON.parse(artistsData);

    const artist = artists.find((artist: Artist) => artist.id === artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found." });
    }

    res.status(200).json(artist);

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
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

    res.status(201).json( artist );

  } catch (error) {
    // 에러 처리
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/", async (req: Request, res: Response) => {
  const artistId = req.user?.artistId;
  if (!artistId) {
    return res.status(400).json({ message: "Artist ID is missing from the user data." });
  }

  try {
    const artistsData = await fs.promises.readFile(artistFilePath, "utf8");
    let artists: Artist[] = JSON.parse(artistsData);

    const artistIndex = artists.findIndex((artist) => artist.id === artistId);
    if (artistIndex === -1) {
      return res.status(404).json({ message: "Artist not found." });
    }
    artists.splice(artistIndex, 1);

    await fs.promises.writeFile(artistFilePath, JSON.stringify(artists));

    const usersData = await fs.promises.readFile(usersFilePath, "utf8");
    let users: User[] = JSON.parse(usersData);

    const userIndex = users.findIndex((user) => user.artistId === artistId);
    if (userIndex !== -1) {
      users[userIndex].artistId = null;
      await fs.promises.writeFile(usersFilePath, JSON.stringify(users));
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});


router.patch("/", artistValidationRules, validateArtist, upload.single('image'), async (req: Request, res: Response) => {
  const artistId = req.user?.artistId
  const updateData = req.body;
  if (req.file) {
    updateData.artistImageURL = `https://aesopos.co.kr/images/${req.file.filename}`;
  }

  try {
    const artistsData = await fs.promises.readFile(artistFilePath, "utf8");
    let artists: Artist[] = JSON.parse(artistsData);

    const artistIndex = artists.findIndex((artist) => artist.id === artistId);
    if (artistIndex === -1) {
      return res.status(404).json({ message: "Artist not found." });
    }

    // 기존 아티스트 정보를 업데이트합니다.
    artists[artistIndex] = { ...artists[artistIndex], ...updateData };

    await fs.promises.writeFile(artistFilePath, JSON.stringify(artists));

    res.status(200).json(artists[artistIndex]);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});


export default router;
