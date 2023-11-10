import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Artist } from "../models/artistModel";
import { User } from '../models/userModel';
import { userValidationRules, validateUser } from '../utils/ModelCheck/userModelCheck';
import upload from "../utils/saveImage";

const router = express.Router();
const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');
const artistsFilePath = path.join(__dirname, '..', 'DB', 'artists.json');

router.get("/", (req: Request, res: Response) => {
  // authenticateToken 미들웨어에서 추가된 user 사용
  const user: User = req.user as User;

  // 사용자 정보 반환
  res.json(user);
});



router.patch("/", userValidationRules, validateUser, upload.single('image'), async (req: Request, res: Response) => {
  // authenticateToken 미들웨어에서 추가된 user 사용
  const user: User = req.user as User;

  // user가 유효한지 확인
  if (!user) {
    return res.status(403).send({ message: "User not authenticated" });
  }

  // 파일 업로드가 있을 경우 이미지 URL 업데이트
  const updatedData = req.body;
  if (req.file) {
    updatedData.userImageURL = `https://aesopos.co.kr/images/${req.file.filename}`;
  }

  // 사용자 정보 업데이트
  Object.assign(user, updatedData);

  try {
    // 파일에서 사용자 목록을 비동기적으로 읽어옵니다.
    const users: User[] = JSON.parse(await fs.promises.readFile(usersFilePath, "utf8"));

    // userId에 해당하는 사용자 찾기
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      return res.status(404).send({ message: "User not found" });
    }

    // 사용자 정보 업데이트
    users[userIndex] = user;

    // 업데이트된 사용자 목록을 파일에 비동기적으로 다시 씁니다.
    await fs.promises.writeFile(usersFilePath, JSON.stringify(users));

    res.send({ message: "User profile updated successfully!", user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred while updating the profile" });
  }
});



router.post("/follow/", async (req: Request, res: Response) => {
  const user: User = req.user as User;
  const { artistId } = req.body; // artistId를 req.body에서 구조 분해 할당

  if (!user) {
    return res.status(403).send({ message: "User not authenticated" });
  }

  if (!artistId) {
    return res.status(400).send({ message: "Artist ID is required" });
  }

  try {
    // 파일에서 사용자 목록을 비동기적으로 읽어옵니다.
    const users: User[] = JSON.parse(await fs.promises.readFile(usersFilePath, "utf8"));
    const artists: Artist[] = JSON.parse(await fs.promises.readFile(artistsFilePath, "utf8"));

    // 사용자의 follow 배열에 아티스트 ID 추가
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      return res.status(404).send({ message: "User not found" });
    }

    users[userIndex].follow = users[userIndex].follow || [];

    if (users[userIndex].follow.includes(artistId)) {
      return res.status(409).send({ message: "User is already following the artist" });
    }
    users[userIndex].follow = [...(users[userIndex].follow || []), artistId];

    // 아티스트의 followers 배열에 사용자 ID 추가
    const artistIndex = artists.findIndex(a => a.id === artistId);
    if (artistIndex === -1) {
      return res.status(404).send({ message: "Artist not found" });
    }

    artists[artistIndex].followers = artists[artistIndex].followers || [];

    if (artists[artistIndex].followers.includes(user.id)) {
      return res.status(409).send({ message: "Artist already has the user as a follower" });
    }
    artists[artistIndex].followers = [...(artists[artistIndex].followers || []), user.id];

    // 업데이트된 사용자 목록을 파일에 비동기적으로 다시 씁니다.
    await fs.promises.writeFile(usersFilePath, JSON.stringify(users));
    await fs.promises.writeFile(artistsFilePath, JSON.stringify(artists));

    res.send({ message: "Followed artist successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred while following the artist" });
  }
});



router.post("/unfollow/", async (req: Request, res: Response) => {
  const user: User = req.user as User;
  const { artistId } = req.body;

  if (!user) {
    return res.status(403).send({ message: "User not authenticated" });
  }

  if (!artistId) {
    return res.status(400).send({ message: "Artist ID is required" });
  }

  try {
    const users: User[] = JSON.parse(await fs.promises.readFile(usersFilePath, "utf8"));
    const artists: Artist[] = JSON.parse(await fs.promises.readFile(artistsFilePath, "utf8"));

    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      return res.status(404).send({ message: "User not found" });
    }

    // 이미 팔로우하고 있지 않은지 확인
    if (!users[userIndex].follow.includes(artistId)) {
      return res.status(409).send({ message: "User is not following the artist" });
    }

    users[userIndex].follow = users[userIndex].follow || [];

    users[userIndex].follow = users[userIndex].follow.filter(id => id !== artistId);

    const artistIndex = artists.findIndex(a => a.id === artistId);
    if (artistIndex === -1) {
      return res.status(404).send({ message: "Artist not found" });
    }

    // 이미 팔로워가 아닌지 확인
    if (!artists[artistIndex].followers.includes(user.id)) {
      return res.status(409).send({ message: "Artist does not have this user as a follower" });
    }

    artists[artistIndex].followers = artists[artistIndex].followers || [];

    artists[artistIndex].followers = artists[artistIndex].followers.filter(id => id !== user.id);

    await fs.promises.writeFile(usersFilePath, JSON.stringify(users));
    await fs.promises.writeFile(artistsFilePath, JSON.stringify(artists));

    res.send({ message: "Unfollowed artist successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred while unfollowing the artist" });
  }
});



router.post("/block/", async (req: Request, res: Response) => {
  const user: User = req.user as User;
  const { artistId } = req.body;

  if (!user) {
    return res.status(403).send({ message: "User not authenticated" });
  }

  if (!artistId) {
    return res.status(400).send({ message: "Artist ID is required" });
  }

  try {
    const users: User[] = JSON.parse(await fs.promises.readFile(usersFilePath, "utf8"));

    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      return res.status(404).send({ message: "User not found" });
    }

    users[userIndex].block = users[userIndex].block || [];

    if (users[userIndex].follow.includes(artistId)) {
      return res.status(409).send({ message: "User is already blocking the artist" });
    }
    users[userIndex].block = [...(users[userIndex].block || []), artistId];

    await fs.promises.writeFile(usersFilePath, JSON.stringify(users));

    res.send({ message: "Blocked artist successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred while blocking the artist" });
  }
});



router.post("/unblock/", async (req: Request, res: Response) => {
  const user: User = req.user as User;
  const { artistId } = req.body;

  if (!user) {
    return res.status(403).send({ message: "User not authenticated" });
  }

  if (!artistId) {
    return res.status(400).send({ message: "Artist ID is required" });
  }

  try {
    const users: User[] = JSON.parse(await fs.promises.readFile(usersFilePath, "utf8"));

    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      return res.status(404).send({ message: "User not found" });
    }

    if (!users[userIndex].block.includes(artistId)) {
      return res.status(409).send({ message: "User is not blocking the artist" });
    }

    users[userIndex].block = users[userIndex].block || [];

    users[userIndex].block = users[userIndex].block.filter(id => id !== artistId);

    await fs.promises.writeFile(usersFilePath, JSON.stringify(users));

    res.send({ message: "Unblocked artist successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred while unblocking the artist" });
  }
});

export default router;
