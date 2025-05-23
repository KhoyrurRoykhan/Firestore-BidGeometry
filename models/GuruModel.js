import db from "../config/firebase.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateTokenKelas } from "../controllers/utils/generateToken.js";

const guruCollection = db.collection("guru");

// Fungsi untuk generate token 8 karakter
const generateToken = () => {
  return crypto.randomBytes(4).toString("hex"); // 4 bytes = 8 karakter hex
};

// 🔹 Ambil semua data guru
export const getGuru = async (req, res) => {
    try {
      const snapshot = await guruCollection.get();
      const guruList = snapshot.docs.map(doc => ({
        id: doc.id,
        nama: doc.data().nama,
        email: doc.data().email,
        instansi: doc.data().instansi,
        token: doc.data().token,
        kkm: doc.data().kkm
      }));
      res.json(guruList);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Gagal mengambil data guru" });
    }
  };
  
  // 🔹 Registrasi guru baru
  export const RegisterGuru = async (req, res) => {
    const { nama, email, password, confPassword, instansi, kkm } = req.body;
  
    if (password !== confPassword)
      return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
  
    try {
      // Cek apakah email sudah digunakan
      const emailSnapshot = await guruCollection.where("email", "==", email).get();
      if (!emailSnapshot.empty) {
        return res.status(400).json({ msg: "Email sudah terdaftar" });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
  
      // Generate token unik untuk kelas
      let token;
      let tokenUnique = false;
      while (!tokenUnique) {
        token = generateTokenKelas();
        const tokenSnapshot = await guruCollection.where("token", "==", token).get();
        if (tokenSnapshot.empty) tokenUnique = true;
      }
  
      // Tambahkan guru ke Firestore
      await guruCollection.add({
        nama,
        email,
        password: hashPassword,
        instansi: instansi || "",
        token,
        kkm: kkm || 70, // Default 70 jika tidak dikirim
        refresh_token: ""
      });
  
      res.json({ msg: "Registrasi Guru Berhasil" });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Terjadi kesalahan saat registrasi guru" });
    }
  };