import db from "../config/firebase.js";

const nilaiCollection = db.collection("nilai_siswa");
const usersCollection = db.collection("siswa");

export const getNilaiByTokenKelas = async (req, res) => {
  const { token_kelas } = req.query;

  try {
    // Ambil semua user dengan token_kelas yang sesuai
    const usersSnapshot = await usersCollection
      .where("token_kelas", "==", token_kelas)
      .get();

    if (usersSnapshot.empty) {
      return res.json([]);
    }

    // Ambil userId dari hasil query
    const usersMap = {};
    usersSnapshot.forEach(doc => {
      usersMap[doc.id] = doc.data(); // simpan data user berdasarkan ID
    });

    const userIds = Object.keys(usersMap);

    // Ambil semua nilai yang userId-nya cocok
    const nilaiSnapshot = await nilaiCollection
      .where("id_user", "in", userIds.slice(0, 10))
      .get();

      const hasil = [];
      nilaiSnapshot.forEach(doc => {
        const nilaiData = doc.data();
        const userData = usersMap[nilaiData.id_user]; // disesuaikan
      
        if (userData) {
          hasil.push({
            id: doc.id,
            ...nilaiData,
            user: {
              id: nilaiData.id_user,
              nama: userData.nama,
              nisn: userData.nisn,
              token_kelas: userData.token_kelas
            }
          });
        }
      });

    res.json(hasil);

  } catch (error) {
    console.error("Error mengambil nilai berdasarkan token kelas:", error);
    res.status(500).json({ msg: "Gagal mengambil data nilai berdasarkan token kelas" });
  }
};


export const getNilaiByUser = async (req, res) => {
  const { email } = req;

  try {
    // Cari user berdasarkan email
    const userSnapshot = await usersCollection.where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // Cari nilai berdasarkan userId
    const nilaiSnapshot = await nilaiCollection.where("id_user", "==", userId).limit(1).get();
    if (nilaiSnapshot.empty) {
      return res.json([]); // Tidak ditemukan, kirim array kosong
    }

    const nilaiDoc = nilaiSnapshot.docs[0];
    res.json([nilaiDoc.data()]); // Bungkus array agar bisa .map di frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Gagal mengambil nilai user" });
  }
};

export const updateKuis1 = async (req, res) => {
  const { email } = req;
  const { nilai } = req.body;

  if (typeof nilai !== 'number' || nilai < 0 || nilai > 100) {
    return res.status(400).json({ msg: "Nilai harus berupa angka antara 0 - 100" });
  }

  try {
    // 🔍 Cari user berdasarkan email
    const userSnapshot = await usersCollection.where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // 🔍 Cek apakah data nilai untuk user ini sudah ada
    const nilaiSnapshot = await nilaiCollection.where("id_user", "==", userId).limit(1).get();

    if (nilaiSnapshot.empty) {
      // 📄 Belum ada, buat baru
      await nilaiCollection.add({
        id_user: userId,
        kuis_1: nilai
      });
    } else {
      // ✏️ Sudah ada, update kuis_1
      const nilaiDocId = nilaiSnapshot.docs[0].id;
      await nilaiCollection.doc(nilaiDocId).update({
        kuis_1: nilai
      });
    }

    res.json({ msg: "Nilai kuis_1 berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal memperbarui nilai kuis_1:", error);
    res.status(500).json({ msg: "Gagal memperbarui nilai kuis_1" });
  }
};

export const updateKuis2 = async (req, res) => {
  const { email } = req;
  const { nilai } = req.body;

  if (typeof nilai !== 'number' || nilai < 0 || nilai > 100) {
    return res.status(400).json({ msg: "Nilai harus berupa angka antara 0 - 100" });
  }

  try {
    // 🔍 Cari user berdasarkan email
    const userSnapshot = await usersCollection.where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // 🔍 Cek apakah data nilai untuk user ini sudah ada
    const nilaiSnapshot = await nilaiCollection.where("id_user", "==", userId).limit(1).get();

    if (nilaiSnapshot.empty) {
      // 📄 Belum ada, buat baru
      await nilaiCollection.add({
        id_user: userId,
        kuis_2: nilai
      });
    } else {
      // ✏️ Sudah ada, update kuis_1
      const nilaiDocId = nilaiSnapshot.docs[0].id;
      await nilaiCollection.doc(nilaiDocId).update({
        kuis_2: nilai
      });
    }

    res.json({ msg: "Nilai kuis_2 berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal memperbarui nilai kuis_2:", error);
    res.status(500).json({ msg: "Gagal memperbarui nilai kuis_2" });
  }
};

export const updateKuis3 = async (req, res) => {
  const { email } = req;
  const { nilai } = req.body;

  if (typeof nilai !== 'number' || nilai < 0 || nilai > 100) {
    return res.status(400).json({ msg: "Nilai harus berupa angka antara 0 - 100" });
  }

  try {
    // 🔍 Cari user berdasarkan email
    const userSnapshot = await usersCollection.where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // 🔍 Cek apakah data nilai untuk user ini sudah ada
    const nilaiSnapshot = await nilaiCollection.where("id_user", "==", userId).limit(1).get();

    if (nilaiSnapshot.empty) {
      // 📄 Belum ada, buat baru
      await nilaiCollection.add({
        id_user: userId,
        kuis_3: nilai
      });
    } else {
      // ✏️ Sudah ada, update kuis_1
      const nilaiDocId = nilaiSnapshot.docs[0].id;
      await nilaiCollection.doc(nilaiDocId).update({
        kuis_3: nilai
      });
    }

    res.json({ msg: "Nilai kuis_3 berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal memperbarui nilai kuis_3:", error);
    res.status(500).json({ msg: "Gagal memperbarui nilai kuis_3" });
  }
};

export const updateKuis4 = async (req, res) => {
  const { email } = req;
  const { nilai } = req.body;

  if (typeof nilai !== 'number' || nilai < 0 || nilai > 100) {
    return res.status(400).json({ msg: "Nilai harus berupa angka antara 0 - 100" });
  }

  try {
    // 🔍 Cari user berdasarkan email
    const userSnapshot = await usersCollection.where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // 🔍 Cek apakah data nilai untuk user ini sudah ada
    const nilaiSnapshot = await nilaiCollection.where("id_user", "==", userId).limit(1).get();

    if (nilaiSnapshot.empty) {
      // 📄 Belum ada, buat baru
      await nilaiCollection.add({
        id_user: userId,
        kuis_4: nilai
      });
    } else {
      // ✏️ Sudah ada, update kuis_1
      const nilaiDocId = nilaiSnapshot.docs[0].id;
      await nilaiCollection.doc(nilaiDocId).update({
        kuis_4: nilai
      });
    }

    res.json({ msg: "Nilai kuis_4 berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal memperbarui nilai kuis_4:", error);
    res.status(500).json({ msg: "Gagal memperbarui nilai kuis_4" });
  }
};

export const updateKuis5 = async (req, res) => {
  const { email } = req;
  const { nilai } = req.body;

  if (typeof nilai !== 'number' || nilai < 0 || nilai > 100) {
    return res.status(400).json({ msg: "Nilai harus berupa angka antara 0 - 100" });
  }

  try {
    // 🔍 Cari user berdasarkan email
    const userSnapshot = await usersCollection.where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // 🔍 Cek apakah data nilai untuk user ini sudah ada
    const nilaiSnapshot = await nilaiCollection.where("id_user", "==", userId).limit(1).get();

    if (nilaiSnapshot.empty) {
      // 📄 Belum ada, buat baru
      await nilaiCollection.add({
        id_user: userId,
        kuis_5: nilai
      });
    } else {
      // ✏️ Sudah ada, update kuis_1
      const nilaiDocId = nilaiSnapshot.docs[0].id;
      await nilaiCollection.doc(nilaiDocId).update({
        kuis_5: nilai
      });
    }

    res.json({ msg: "Nilai kuis_5 berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal memperbarui nilai kuis_5:", error);
    res.status(500).json({ msg: "Gagal memperbarui nilai kuis_5" });
  }
};

export const updateEvaluasi = async (req, res) => {
  const { email } = req;
  const { nilai } = req.body;

  if (typeof nilai !== 'number' || nilai < 0 || nilai > 100) {
    return res.status(400).json({ msg: "Nilai harus berupa angka antara 0 - 100" });
  }

  try {
    // 🔍 Cari user berdasarkan email
    const userSnapshot = await usersCollection.where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // 🔍 Cek apakah data nilai untuk user ini sudah ada
    const nilaiSnapshot = await nilaiCollection.where("id_user", "==", userId).limit(1).get();

    if (nilaiSnapshot.empty) {
      // 📄 Belum ada, buat baru
      await nilaiCollection.add({
        id_user: userId,
        evaluasi: nilai
      });
    } else {
      // ✏️ Sudah ada, update kuis_1
      const nilaiDocId = nilaiSnapshot.docs[0].id;
      await nilaiCollection.doc(nilaiDocId).update({
        evaluasi: nilai
      });
    }

    res.json({ msg: "Nilai evaluasi berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal memperbarui nilai evaluasi:", error);
    res.status(500).json({ msg: "Gagal memperbarui nilai evaluasi" });
  }
};