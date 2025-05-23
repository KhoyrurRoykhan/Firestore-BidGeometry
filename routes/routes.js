import express from "express";
import {
  Register,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../models/UserModel.js"; // 

import { Login, Logout, countSiswaSelesaiBelajar, countSiswaSelesaiTantangan, countUsersByTokenKelas, deleteUserById, getKKM, getProgresBelajarSiswa, getProgresTantanganSiswa, getUsersByTokenKelas, updateProgresBelajarSiswa, updateProgresTantanganSiswa, updateUserById } from "../controllers/UserController.js"; // 

import { refreshToken } from "../controllers/RefreshToken.js";
import { RegisterGuru } from "../models/GuruModel.js";
import { LoginGuru, LogoutGuru, getKKMByToken, updateKKM } from "../controllers/GuruController.js";
import { refreshTokenGuru } from "../controllers/RefreshTokenGuru.js";
import { getNilaiByTokenKelas, getNilaiByUser, updateEvaluasi, updateKuis1, updateKuis2, updateKuis3, updateKuis4, updateKuis5 } from "../controllers/NilaiController.js";
import { verifyGuruToken } from "../middleware/verifyTokenGuru.js";
import { verifyToken } from "../middleware/verifyToken.js";

const routes = express.Router();

// Route tambah user
routes.post("/users", async (req, res) => {
  try {
    const newUser = await Register(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ambil semua user
routes.get("/users", async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// Ambil user berdasarkan ID
routes.get("/users/:id", async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
  res.json(user);
});


// token
routes.get('/token', refreshToken);

// Route login
routes.post("/login", Login); //
routes.delete("/logout", Logout);

routes.get('/user/progres-belajar', getProgresBelajarSiswa);
routes.put('/user/progres-belajar', updateProgresBelajarSiswa);
routes.get('/user/progres-tantangan', getProgresTantanganSiswa);
routes.put('/user/progres-tantangan', updateProgresTantanganSiswa);

routes.get('/count-users', countUsersByTokenKelas);
routes.get('/count-selesai-belajar', countSiswaSelesaiBelajar);
routes.get('/count-selesai-tantangan', countSiswaSelesaiTantangan);
routes.put('/users/:id', updateUserById);
routes.delete('/users/:id', deleteUserById);

routes.get('/users-by-token', getUsersByTokenKelas);
routes.get('/kkm/kuis', verifyToken, getKKM);


//nilai
routes.get("/nilai-by-token", getNilaiByTokenKelas);
routes.get('/nilai/by-user', verifyToken, getNilaiByUser);
routes.put('/nilai/kuis-1', verifyToken, updateKuis1);
routes.put('/nilai/kuis-2', verifyToken, updateKuis2);
routes.put('/nilai/kuis-3', verifyToken, updateKuis3);
routes.put('/nilai/kuis-4', verifyToken, updateKuis4);
routes.put('/nilai/kuis-5', verifyToken, updateKuis5);
routes.put('/nilai/evaluasi', verifyToken, updateEvaluasi);

//guru
routes.post("/guru", RegisterGuru);
routes.post("/login-guru", LoginGuru);
routes.delete("/logout-guru", LogoutGuru);
routes.get('/token-guru', refreshTokenGuru);
routes.get('/kkm', getKKMByToken);
routes.put('/guru/kkm', verifyGuruToken, updateKKM);

export default routes;