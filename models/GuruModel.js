import db from "../config/firebase.js";
import bcrypt from "bcrypt";
import { generateTokenKelas } from "../controllers/utils/generateToken.js";

const guruCollection = db.collection("guru");
const kkmCollection = db.collection("kkm");

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
    }));
    res.json(guruList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Gagal mengambil data guru" });
  }
};

// 🔹 Registrasi guru baru
export const RegisterGuru = async (req, res) => {
  const { nama, email, password, confPassword, instansi } = req.body;

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
      refresh_token: ""
    });

    // Buat data KKM default yang berelasi dengan token guru
    await kkmCollection.add({
      token,
      kuis_1: 70,
      kuis_2: 70,
      kuis_3: 70,
      kuis_4: 70,
      kuis_5: 70,
      evaluasi: 70
    });

    res.json({ msg: "Registrasi Guru Berhasil" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan saat registrasi guru" });
  }
};
