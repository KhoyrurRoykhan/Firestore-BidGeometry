import db from "../config/firebase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const guruCollection = db.collection("guru");

export const LoginGuru = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cek apakah email guru ditemukan
    const snapshot = await guruCollection.where("email", "==", email).limit(1).get();
    if (snapshot.empty) return res.status(404).json({ msg: "Email tidak ditemukan" });

    const doc = snapshot.docs[0];
    const guruData = doc.data();

    // 2. Cek kecocokan password
    const match = await bcrypt.compare(password, guruData.password);
    if (!match) return res.status(400).json({ msg: "Password salah" });

    const userId = doc.id;
    const { nama, instansi, token, kkm } = guruData;

    // 3. Buat access token dan refresh token
    const accessToken = jwt.sign(
      { userId, nama, email, instansi, token, kkm },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '25s' }
    );

    const refreshToken = jwt.sign(
      { userId, nama, email, instansi, token },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Simpan refreshToken di Firestore
    await guruCollection.doc(userId).update({
      refresh_token: refreshToken
    });

    // 5. Set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'none'
    });

    // 6. Kirim access token ke client
    res.json({ accessToken });

  } catch (error) {
    console.error("LoginGuru Error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat login guru" });
  }
};

// Logout guru (versi Firestore)
export const LogoutGuru = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return res.sendStatus(204); // Tidak ada token = tidak perlu logout
  
      // Cari guru berdasarkan refresh token
      const snapshot = await guruCollection
        .where("refresh_token", "==", refreshToken)
        .limit(1)
        .get();
  
      if (snapshot.empty) return res.sendStatus(204); // Token tidak ditemukan di DB
  
      const doc = snapshot.docs[0];
  
      // Hapus refresh_token dari Firestore
      await guruCollection.doc(doc.id).update({
        refresh_token: null
      });
  
      // Hapus cookie dari browser
      res.clearCookie("refreshToken");
      return res.sendStatus(200);
    } catch (error) {
      console.error("LogoutGuru Error:", error);
      res.status(500).json({ msg: "Terjadi kesalahan saat logout guru" });
    }
  };
  
  export const getKKMByToken = async (req, res) => {
    const { token_kelas } = req.query;
  
    try {
      // Cari dokumen guru yang memiliki field token == token_kelas
      const snapshot = await guruCollection.where("token", "==", token_kelas).limit(1).get();
  
      if (snapshot.empty) {
        return res.status(404).json({ msg: "KKM tidak ditemukan untuk token tersebut" });
      }
  
      const guruData = snapshot.docs[0].data();
  
      res.json({ kkm: guruData.kkm });
  
    } catch (error) {
      console.error("Gagal mengambil KKM:", error);
      res.status(500).json({ msg: "Gagal mengambil KKM" });
    }
  };

  export const updateKKM = async (req, res) => {
    const { kkm } = req.body;
    const guruId = req.guruId; // Diambil dari token / middleware auth
  
    try {
      const guruDoc = guruCollection.doc(guruId);
      const docSnapshot = await guruDoc.get();
  
      if (!docSnapshot.exists) {
        return res.status(404).json({ msg: "Data guru tidak ditemukan" });
      }
  
      await guruDoc.update({ kkm });
  
      res.json({ msg: "KKM berhasil diperbarui" });
    } catch (error) {
      console.error("Gagal memperbarui KKM:", error);
      res.status(500).json({ msg: "Gagal memperbarui KKM" });
    }
  };

  