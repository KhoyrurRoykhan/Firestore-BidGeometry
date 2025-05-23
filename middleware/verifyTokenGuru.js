import jwt from "jsonwebtoken";

export const verifyGuruToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    // optional: validasi bahwa dia memang guru
    req.guruId = decoded.userId;
    req.email = decoded.email;
    next();
  });
};