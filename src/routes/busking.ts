import express, { Request, Response } from "express";
import fs from 'fs';
import path from "path";
import { Artist } from "../models/artistModel";
import { Busking } from "../models/buskingModel";
import { buskingValidationRules, validateBusking } from '../utils/ModelCheck/buskingModelCheck';

const router = express.Router();
const buskingFilePath = path.join(__dirname, '..', 'DB', 'buskings.json');
const artistFilePath = path.join(__dirname, '..', 'DB', 'artists.json');

router.get("/", (req: Request, res: Response) => {
  // 사용자 목록 가져오기
});

router.get("/all/", async (req: Request, res: Response) => {
  try {
    const buskingData = await fs.promises.readFile(buskingFilePath, "utf8");
    const buskings = JSON.parse(buskingData);

    res.status(200).json(buskings);
  } catch (error) {

    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.get("/now/", (req: Request, res: Response) => {
  // 사용자 목록 가져오기
});

router.post("/", buskingValidationRules, validateBusking, async (req: Request, res: Response) => {
  try {
    const artistId = req.user?.artistId;
    const busking: Busking = req.body;

    const artists: Artist[] = JSON.parse(await fs.promises.readFile(artistFilePath, "utf8"));
    const artist = artists.find((artist) => artist.id === artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const buskings = JSON.parse(await fs.promises.readFile(buskingFilePath, "utf8"));

    let newId = buskings.length > 0 ? buskings[buskings.length - 1].id + 1 : 1;
    busking.id = newId;
    busking.artistImageURL = artist.artistImageURL;

    buskings.push(busking);

    await fs.promises.writeFile(buskingFilePath, JSON.stringify(buskings), "utf8");

    res.status(201).json(busking);
  } catch (error) {
    res.status(500).json({ message: "Post Busking Fail" });
  }
});


router.delete("/", async (req: Request, res: Response) => {
  const buskingId = req.body.buskingId;
  const artistId = req.user?.artistId;

  if (!buskingId) {
    return res.status(400).json({ message: "Busking ID is missing from the request." });
  }

  try {
    const artistData = await fs.promises.readFile(artistFilePath, "utf8");
    let artists: Artist[] = JSON.parse(artistData);

    const artistIndex = artists.findIndex((artist) => artist.id === artistId);
    if (artistIndex === -1) {
      return res.status(404).json({ message: "Artist not found." });
    }

    let artist = artists[artistIndex];
    if (artist.buskings) {
      artist.buskings = artist.buskings.filter((id) => id !== buskingId);
      await fs.promises.writeFile(artistFilePath, JSON.stringify(artists), "utf8");
    }

    const buskingData = await fs.promises.readFile(buskingFilePath, "utf8");
    let buskings: Busking[] = JSON.parse(buskingData);

    const buskingIndex = buskings.findIndex((busking) => busking.id === buskingId);
    if (buskingIndex !== -1) {

      buskings.splice(buskingIndex, 1);

      await fs.promises.writeFile(buskingFilePath, JSON.stringify(buskings), "utf8");
    }

    res.status(200).json({ message: "Busking deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Busking deleted fail." });
  }
});

export default router;
