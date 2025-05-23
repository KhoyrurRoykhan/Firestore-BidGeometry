import db from "../config/firebase.js";
import jwt from "jsonwebtoken";

const guruCollection = db.collection("guru");

export const refreshTokenGuru = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    // Cari guru berdasarkan refresh token
    const snapshot = await guruCollection.where("refresh_token", "==", refreshToken).limit(1).get();
    if (snapshot.empty) return res.sendStatus(403);

    const doc = snapshot.docs[0];
    const guruData = doc.data();

    // Verifikasi refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);

      const userId = doc.id;
      const { nama, email, instansi, token, kkm } = guruData;

      const accessToken = jwt.sign(
        { userId, nama, email, instansi, token, kkm },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '25s' }
      );

      res.json({ accessToken });
    });
  } catch (error) {
    console.error("refreshTokenGuru Error:", error);
    res.sendStatus(500);
  }
};