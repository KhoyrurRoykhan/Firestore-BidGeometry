import db from "../config/firebase.js";
import bcrypt from "bcrypt"; // pastikan sudah di-install

const siswaCollection = db.collection("siswa");
const nilaiCollection = db.collection("nilai_siswa");

export const Register = async (userData) => {
  try {
    const { nama, nisn, email, password, confPassword, token_kelas } = userData;

    // 1. Validasi wajib
    if (!nisn || !nama || !email || !password || !confPassword) {
      throw new Error("Semua field wajib diisi (termasuk nisn)");
    }

    if (password !== confPassword) {
      throw new Error("Password dan Confirm Password tidak cocok");
    }

    // 2. Cek apakah email sudah digunakan
    const emailExists = await siswaCollection.where("email", "==", email).get();
    if (!emailExists.empty) {
      throw new Error("Email sudah terdaftar");
    }

    // 3. Cek apakah NISN sudah digunakan
    const nisnExists = await siswaCollection.where("nisn", "==", nisn).get();
    if (!nisnExists.empty) {
      throw new Error("NISN sudah terdaftar");
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Simpan user baru
    const userDocRef = await siswaCollection.add({
      nama,
      nisn,
      email,
      password: hashedPassword,
      token_kelas: token_kelas || "",
      progres_belajar: 0,
      progres_tantangan: 0,
      refresh_token: "",
    });

    // 6. Buat nilai default untuk user tersebut
    await nilaiCollection.add({
      id_user: userDocRef.id,
      kuis_1: null,
      kuis_2: null,
      kuis_3: null,
      kuis_4: null,
      kuis_5: null,
      evaluasi: null,
    });

    // 7. Return data
    return {
      msg: "Registrasi berhasil",
      id: userDocRef.id,
      nama,
      nisn,
      email,
      token_kelas: token_kelas || "",
      progres_belajar: 0,
      progres_tantangan: 0,
    };

  } catch (error) {
    throw new Error(error.message || "Gagal menambahkan user");
  }
};

// Ambil semua siswa
export const getAllUsers = async () => {
  const snapshot = await siswaCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Ambil siswa berdasarkan ID dokumen
export const getUserById = async (id) => {
  const doc = await siswaCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

// Ambil siswa berdasarkan email
export const getUserByEmail = async (email) => {
  const snapshot = await siswaCollection.where("email", "==", email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

// Update siswa
export const updateUser = async (id, data) => {
  await siswaCollection.doc(id).update(data);
  return true;
};

// Hapus siswa
export const deleteUser = async (id) => {
  await siswaCollection.doc(id).delete();
  return true;
};
