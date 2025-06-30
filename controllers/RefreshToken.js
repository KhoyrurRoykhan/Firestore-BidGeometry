import db from "../config/firebase.js";
import jwt from "jsonwebtoken";

const siswaCollection = db.collection("siswa");

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    // Cari siswa berdasarkan refresh_token
    const snapshot = await siswaCollection
      .where("refresh_token", "==", refreshToken)
      .limit(1)
      .get();

    if (snapshot.empty) return res.sendStatus(403);

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);

      const nama = userData.nama;
      const email = userData.email;
      const token_kelas = userData.token_kelas || "";

      const accessToken = jwt.sign(
        { userId, nama, email, token_kelas },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};
