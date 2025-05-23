  import bcrypt from "bcrypt";
  import jwt from "jsonwebtoken";
  import db from "../config/firebase.js";

  const usersCollection = db.collection("users");
  const guruCollection = db.collection("guru");

  export const Login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Cek apakah user dengan email tersebut ada
      const snapshot = await usersCollection.where("email", "==", email).limit(1).get();
      if (snapshot.empty) {
        return res.status(404).json({ msg: "Email tidak ditemukan" });
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Bandingkan password
      const match = await bcrypt.compare(password, userData.password);
      if (!match) {
        return res.status(400).json({ msg: "Password salah" });
      }

      const nama = userData.nama;
      const token_kelas = userData.token_kelas || "";

      // Generate accessToken & refreshToken
      const accessToken = jwt.sign(
        { userId, nama, email, token_kelas },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const refreshToken = jwt.sign(
        { userId, nama, email, token_kelas },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      // Simpan refresh_token ke database
      await usersCollection.doc(userId).update({
        refresh_token: refreshToken,
      });

      // Kirim refresh token via cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "none",
      });

      // Kirim access token sebagai respon
      res.json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Terjadi kesalahan saat login" });
    }
  };

  export const Logout = async (req, res) => {
      try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.sendStatus(204); // No content, tidak perlu logout
    
        // Cari user berdasarkan refresh_token
        const snapshot = await usersCollection
          .where("refresh_token", "==", refreshToken)
          .limit(1)
          .get();
    
        if (snapshot.empty) return res.sendStatus(204);
    
        const userDoc = snapshot.docs[0];
        const userId = userDoc.id;
    
        // Hapus refresh_token dari Firestore
        await usersCollection.doc(userId).update({
          refresh_token: null,
        });
    
        // Hapus cookie dari browser
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
        });
    
        return res.sendStatus(200); // Logout berhasil
      } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan saat logout" });
      }
    };
    
    export const getProgresBelajarSiswa = async (req, res) => {
      try {
        // Ambil token dari header Authorization
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ msg: "Token tidak ditemukan" });
    
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.userId;
    
        // Ambil data user dari Firestore berdasarkan ID
        const userDoc = await usersCollection.doc(userId).get();
    
        if (!userDoc.exists) {
          return res.status(404).json({ msg: "Siswa tidak ditemukan" });
        }
    
        const userData = userDoc.data();
        const progresBelajar = userData.progres_belajar || [];
    
        // Kirim progres belajar
        res.json({ progres_belajar: progresBelajar });
      } catch (error) {
        console.error(error);
        return res.status(403).json({ msg: "Token tidak valid atau terjadi kesalahan" });
      }
    };

    export const updateProgresBelajarSiswa = async (req, res) => {
      try {
        // Ambil token dari header Authorization
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ msg: "Token tidak ditemukan" });
    
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.userId;
    
        const { progres_belajar } = req.body;
    
        if (progres_belajar == null) {
          return res.status(400).json({ msg: "Nilai progres_belajar tidak boleh kosong" });
        }
    
        // Ambil dokumen user
        const userRef = usersCollection.doc(userId);
        const userDoc = await userRef.get();
    
        if (!userDoc.exists) {
          return res.status(404).json({ msg: "Siswa tidak ditemukan" });
        }
    
        // Update progres belajar
        await userRef.update({ progres_belajar });
    
        res.json({
          msg: "Progres belajar berhasil diperbarui",
          progres_belajar,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
      }
    };


    export const countUsersByTokenKelas = async (req, res) => {
      try {
        const { token_kelas } = req.query;
    
        if (!token_kelas) {
          return res.status(400).json({ msg: "token_kelas harus disertakan" });
        }
    
        const snapshot = await usersCollection.where("token_kelas", "==", token_kelas).get();
        const count = snapshot.size;
    
        res.json({ count });
      } catch (error) {
        console.error("Gagal menghitung siswa:", error);
        res.status(500).json({ msg: "Gagal menghitung siswa" });
      }
    };

    export const countSiswaSelesaiBelajar = async (req, res) => {
      try {
        const { token_kelas } = req.query;
    
        // Query Firestore: cari dokumen dengan token_kelas dan progres_belajar = 28
        const snapshot = await usersCollection
          .where("token_kelas", "==", token_kelas)
          .where("progres_belajar", "==", 28)
          .get();
    
        const count = snapshot.size;
    
        res.json({ count });
      } catch (error) {
        console.error("Error menghitung siswa selesai belajar:", error);
        res.status(500).json({ msg: "Gagal menghitung siswa selesai belajar" });
      }
    };

    export const countSiswaSelesaiTantangan = async (req, res) => {
      try {
        const { token_kelas } = req.query;
    
        const snapshot = await usersCollection
          .where("token_kelas", "==", token_kelas)
          .where("progres_tantangan", "==", 12)
          .get();
    
        const count = snapshot.size;
    
        res.json({ count });
      } catch (error) {
        console.error("Error menghitung siswa selesai tantangan:", error);
        res.status(500).json({ msg: "Gagal menghitung siswa selesai tantangan" });
      }
    };


    export const getUsersByTokenKelas = async (req, res) => {
      try {
        const { token_kelas } = req.query;
    
        if (!token_kelas) {
          return res.status(400).json({ msg: "Token kelas tidak ditemukan dalam permintaan" });
        }
    
        const snapshot = await usersCollection
          .where("token_kelas", "==", token_kelas)
          .get();
    
        if (snapshot.empty) {
          return res.status(404).json({ msg: "Tidak ada user dengan token_kelas tersebut" });
        }
    
        const users = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nama: data.nama,
            nisn: data.nisn,
            email: data.email,
            progres_belajar: data.progres_belajar,
            progres_tantangan: data.progres_tantangan,
            token_kelas: data.token_kelas,
          };
        });
    
        res.json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal mengambil data user berdasarkan token kelas" });
      }
    };

    export const updateUserById = async (req, res) => {
      try {
        const { id } = req.params;
        const { nama, nisn } = req.body;
    
        const userDoc = await usersCollection.doc(id).get();
        if (!userDoc.exists) {
          return res.status(404).json({ msg: "Siswa tidak ditemukan" });
        }
    
        await usersCollection.doc(id).update({
          nama,
          nisn
        });
    
        res.json({ msg: "Data siswa berhasil diperbarui" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal memperbarui data siswa" });
      }
    };

    export const deleteUserById = async (req, res) => {
      try {
        const { id } = req.params;
    
        const userDoc = await usersCollection.doc(id).get();
        if (!userDoc.exists) {
          return res.status(404).json({ msg: "Siswa tidak ditemukan" });
        }
    
        await usersCollection.doc(id).delete();
    
        res.json({ msg: "Data siswa berhasil dihapus" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal menghapus data siswa" });
      }
    };

    export const getKKM = async (req, res) => {
      try {
        const token_kelas = req.token_kelas; // didapat dari JWT
    
        // Cari dokumen guru dengan token yang cocok
        const snapshot = await guruCollection
          .where("token", "==", token_kelas)
          .limit(1)
          .get();
    
        if (snapshot.empty) {
          return res.status(404).json({ msg: "KKM tidak ditemukan" });
        }
    
        const guruDoc = snapshot.docs[0];
        const data = guruDoc.data();
    
        res.json({ kkm: data.kkm });
      } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Gagal mengambil KKM" });
      }
    };

    export const getProgresTantanganSiswa = async (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ msg: "Token tidak ditemukan" });
    
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.userId;
    
        const userDoc = await usersCollection.doc(userId).get();
    
        if (!userDoc.exists) {
          return res.status(404).json({ msg: "Siswa tidak ditemukan" });
        }
    
        const userData = userDoc.data();
        res.json({ progres_tantangan: userData.progres_tantangan || [] }); // default empty array jika null
      } catch (error) {
        console.error("Token tidak valid atau gagal mengambil data:", error);
        return res.status(403).json({ msg: "Token tidak valid" });
      }
    };

    export const updateProgresTantanganSiswa = async (req, res) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ msg: "Token tidak ditemukan" });
    
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.userId;
    
        const { progres_tantangan } = req.body;
    
        if (progres_tantangan == null) {
          return res.status(400).json({ msg: "Nilai progres_tantangan tidak boleh kosong" });
        }
    
        const userDocRef = usersCollection.doc(userId);
        const userDoc = await userDocRef.get();
    
        if (!userDoc.exists) {
          return res.status(404).json({ msg: "Siswa tidak ditemukan" });
        }
    
        await userDocRef.update({ progres_tantangan });
    
        res.json({
          msg: "Progres tantangan berhasil diperbarui",
          progres_tantangan
        });
      } catch (error) {
        console.error("Gagal memperbarui progres tantangan:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
      }
    };