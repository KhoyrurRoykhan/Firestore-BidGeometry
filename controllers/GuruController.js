import db from "../config/firebase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const guruCollection = db.collection("guru");
const kkmCollection = db.collection("kkm");

// 🔹 Login Guru
export const LoginGuru = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari guru berdasarkan email
    const snapshot = await guruCollection.where("email", "==", email).limit(1).get();
    if (snapshot.empty) return res.status(404).json({ msg: "Email tidak ditemukan" });

    const doc = snapshot.docs[0];
    const guruData = doc.data();

    // 2. Cek password
    const match = await bcrypt.compare(password, guruData.password);
    if (!match) return res.status(400).json({ msg: "Password salah" });

    const userId = doc.id;
    const { nama, instansi, token } = guruData;

    // 3. Buat JWT token
    const accessToken = jwt.sign(
      { userId, nama, email, instansi, token },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '25s' }
    );

    const refreshToken = jwt.sign(
      { userId, nama, email, instansi, token },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Simpan refresh token ke Firestore
    await guruCollection.doc(userId).update({ refresh_token: refreshToken });

    // 5. Set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'none'
    });

    // 6. Kirim access token
    res.json({ accessToken });

  } catch (error) {
    console.error("LoginGuru Error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat login guru" });
  }
};

// 🔹 Logout Guru
export const LogoutGuru = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const snapshot = await guruCollection.where("refresh_token", "==", refreshToken).limit(1).get();
    if (snapshot.empty) return res.sendStatus(204);

    const doc = snapshot.docs[0];
    await guruCollection.doc(doc.id).update({ refresh_token: null });

    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  } catch (error) {
    console.error("LogoutGuru Error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat logout guru" });
  }
};

// 🔹 Ambil KKM berdasarkan token
export const getKKMByToken = async (req, res) => {
  const { token_kelas } = req.query;

  try {
    const snapshot = await kkmCollection.where("token", "==", token_kelas).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ msg: "KKM tidak ditemukan untuk token tersebut" });
    }

    const kkmData = snapshot.docs[0].data();
    res.json({ kkm: kkmData });

  } catch (error) {
    console.error("Gagal mengambil KKM:", error);
    res.status(500).json({ msg: "Gagal mengambil KKM" });
  }
};

// 🔹 Update KKM berdasarkan guru yang login
export const updateKKM = async (req, res) => {
  const { kkm } = req.body;
  const guruId = req.guruId; // Pastikan ada middleware auth yang isi ini

  try {
    const guruDoc = await guruCollection.doc(guruId).get();
    if (!guruDoc.exists) {
      return res.status(404).json({ msg: "Data guru tidak ditemukan" });
    }

    const { token } = guruDoc.data();

    // Ambil dokumen KKM berdasarkan token
    const snapshot = await kkmCollection.where("token", "==", token).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ msg: "Data KKM tidak ditemukan untuk token tersebut" });
    }

    const kkmDocId = snapshot.docs[0].id;

    await kkmCollection.doc(kkmDocId).update(kkm);

    res.json({ msg: "KKM berhasil diperbarui" });

  } catch (error) {
    console.error("Gagal memperbarui KKM:", error);
    res.status(500).json({ msg: "Gagal memperbarui KKM" });
  }
};
