
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();
const { sendEmail } = require("./config/email");

const app = express();
const PORT = process.env.PORT || 5000;

// PENGATURAN BATAS WAKTU TRANSAKSI
const PAYMENT_TIMEOUT_MINUTES = 2;
const CONFIRMATION_TIMEOUT_MINUTES = 2;
// ========================================
// 1. MIDDLEWARE UMUM
// ========================================
app.use(cors());
app.use(express.json());

/* PAYMENT PROOF UPLOAD CONFIGURATION */

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `payment-${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const uploadPaymentProof = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
// ========================================
// UPLOAD FOTO COVER EVENT
// ========================================
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      `event-${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const uploadEventImage = multer({
  storage: eventStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Foto harus JPG, PNG, atau WEBP."));
    }

    cb(null, true);
  },
});

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("File harus berupa gambar JPG, PNG, atau WEBP.")
      );
    }

    cb(null, true);
  },
});


/* EVENT IMAGE UPLOAD CONFIGURATION */

const eventImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `event-${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const uploadEventImage = multer({
  storage: eventImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Foto event harus JPG, PNG, atau WEBP.")
      );
    }

    cb(null, true);
  },
});


/* PROFILE PHOTO UPLOAD CONFIGURATION */

const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extensionByMimeType = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    const extension = extensionByMimeType[file.mimetype];

    cb(
      null,
      `profile-${req.user.id}-${Date.now()}${extension}`
    );
  },
});

const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Foto harus berformat JPG, PNG, atau WEBP.")
      );
    }

    cb(null, true);
  },
});


// ========================================
// 2. MIDDLEWARE VERIFIKASI JWT
// ========================================
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Akses ditolak. Token autentikasi diperlukan.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET belum dikonfigurasi.");

      return res.status(500).json({
        status: "error",
        message: "Konfigurasi autentikasi belum tersedia.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "evently-api",
      audience: "evently-client",
    });

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }
}

// ========================================
// 3. MIDDLEWARE PEMBATASAN ROLE
// ========================================
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Akses ditolak. Role Anda tidak memiliki izin.",
      });
    }

    next();
  };
}

// ========================================
// PROFILE MANAGEMENT
// ========================================

// GET PROFILE
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email, phone, role, profile_picture,
              referral_code, points, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Pengguna tidak ditemukan.",
      });
    }

    return res.json({
      status: "success",
      message: "Profil berhasil diambil.",
      data: users[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil profil.",
    });
  }
});


// UPDATE PROFILE
app.put("/api/profile", verifyToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        status: "error",
        message: "Nama dan email wajib diisi.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone =
      typeof phone === "string" && phone.trim()
        ? phone.trim()
        : null;

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        status: "error",
        message: "Nama harus terdiri dari 2–100 karakter.",
      });
    }

    if (
      cleanEmail.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Format email tidak valid.",
      });
    }

    if (cleanPhone && cleanPhone.length > 20) {
      return res.status(400).json({
        status: "error",
        message: "Nomor telepon maksimal 20 karakter.",
      });
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [cleanEmail, req.user.id]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Email sudah digunakan akun lain.",
      });
    }

    await db.query(
      `UPDATE users
       SET name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [cleanName, cleanEmail, cleanPhone, req.user.id]
    );

    const [updatedUsers] = await db.query(
      `SELECT id, name, email, phone, role, profile_picture,
              referral_code, points, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    return res.json({
      status: "success",
      message: "Profil berhasil diperbarui.",
      data: updatedUsers[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message: "Email sudah digunakan akun lain.",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Gagal memperbarui profil.",
    });
  }
});


// CHANGE PASSWORD
app.put("/api/profile/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        status: "error",
        message: "Password lama dan baru wajib diisi.",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      return res.status(400).json({
        status: "error",
        message: "Password baru harus terdiri dari 8–72 karakter.",
      });
    }

    const [users] = await db.query(
      "SELECT password FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Pengguna tidak ditemukan.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      users[0].password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        status: "error",
        message: "Password lama tidak sesuai.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req.user.id]
    );

    return res.json({
      status: "success",
      message: "Password berhasil diubah.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      status: "error",
      message: "Gagal mengubah password.",
    });
  }
});

// ========================================
// UPLOAD PROFILE PHOTO
// ========================================

app.post(
  "/api/profile/photo",
  verifyToken,
  (req, res, next) => {
    uploadProfilePhoto.single("photo")(req, res, (error) => {
      if (error) {
        const message =
          error.code === "LIMIT_FILE_SIZE"
            ? "Ukuran foto maksimal 2 MB."
            : error.message;

        return res.status(400).json({
          status: "error",
          message,
        });
      }

      next();
    });
  },
  async (req, res) => {
    let newFilePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "Silakan pilih foto terlebih dahulu.",
        });
      }

      newFilePath = `/uploads/${req.file.filename}`;

      const [users] = await db.query(
        "SELECT profile_picture FROM users WHERE id = ? LIMIT 1",
        [req.user.id]
      );

      if (users.length === 0) {
        fs.unlink(req.file.path, () => {});

        return res.status(404).json({
          status: "error",
          message: "Pengguna tidak ditemukan.",
        });
      }

      const oldPhoto = users[0].profile_picture;

      await db.query(
        "UPDATE users SET profile_picture = ? WHERE id = ?",
        [newFilePath, req.user.id]
      );

      // Hapus foto profil lama jika merupakan file profil EVENTLY.
      if (oldPhoto && oldPhoto.startsWith("/uploads/")) {
        const oldFileName = path.basename(oldPhoto);

        if (oldFileName.startsWith(`profile-${req.user.id}-`)) {
          const oldFilePath = path.join(uploadDir, oldFileName);

          if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, (error) => {
              if (error) {
                console.error("Gagal menghapus foto lama:", error);
              }
            });
          }
        }
      }

      return res.json({
        status: "success",
        message: "Foto profil berhasil diperbarui.",
        data: {
          profile_picture: newFilePath,
        },
      });

    } catch (error) {
      console.error("Upload profile photo error:", error);

      if (req.file?.path) {
        fs.unlink(req.file.path, () => {});
      }

      return res.status(500).json({
        status: "error",
        message: "Gagal mengunggah foto profil.",
      });
    }
  }
);


// ========================================
// 4. KONEKSI DATABASE MYSQL
// ========================================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// ========================================
// FORGOT PASSWORD - DEVELOPMENT ONLY
// ========================================
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    // Fitur ini hanya boleh digunakan saat development/testing.
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        status: "error",
        message: "Fitur reset password ini tidak tersedia.",
      });
    }

    const { email, newPassword } = req.body;

    if (
      typeof email !== "string" ||
      typeof newPassword !== "string" ||
      !email.trim() ||
      !newPassword
    ) {
      return res.status(400).json({
        status: "error",
        message: "Email dan password baru wajib diisi.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (newPassword.length < 8 || newPassword.length > 72) {
      return res.status(400).json({
        status: "error",
        message: "Password harus terdiri dari 8–72 karakter.",
      });
    }

    const [users] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Email tidak ditemukan.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, users[0].id]
    );

    return res.json({
      status: "success",
      message: "Password berhasil direset. Silakan login kembali.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      status: "error",
      message: "Gagal mereset password.",
    });
  }
});
// ========================================
// TEST EMAIL - DEVELOPMENT ONLY
// ========================================
app.post("/api/test-email", async (req, res) => {
  try {
    // Endpoint hanya boleh digunakan saat development.
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        status: "error",
        message: "Endpoint test email tidak tersedia.",
      });
    }

    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "EVENTLY - Test Email Berhasil",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #6366f1;">EVENTLY</h2>
          <h3>Email Notification Berhasil!</h3>
          <p>Halo!</p>
          <p>
            Jika kamu menerima email ini, berarti koneksi
            Gmail SMTP EVENTLY sudah berhasil.
          </p>
          <p>Selanjutnya kita siap mengaktifkan notifikasi otomatis.</p>
          <p><strong>EVENTLY Team</strong></p>
        </div>
      `,
    });

    if (!result.success) {
      return res.status(500).json({
        status: "error",
        message: "Email gagal dikirim.",
      });
    }

    return res.json({
      status: "success",
      message: "Email berhasil dikirim ke inbox EVENTLY.",
    });
  } catch (error) {
    console.error("Test email error:", error);

    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengirim email.",
    });
  }
});

// ========================================
// 5. CEK API DAN DATABASE
// ========================================
app.get("/", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      message: "Welcome to EVENTLY API!",
      status: "success",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "API berjalan, tetapi koneksi database gagal.",
      status: "error",
    });
  }
});

// ========================================
// 6. DAFTAR EVENT YANG DIPUBLIKASIKAN
// ========================================
app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        description,
        image_url,
        category,
        location,
        event_date,
        end_date,
        ticket_price,
        total_seats,
        available_seats,
        status
      FROM events
      WHERE status = 'published'
      ORDER BY event_date ASC
    `);

    res.json({
      status: "success",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching events:", error.message);

    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data event.",
    });
  }
});

// ========================================
// 7. DETAIL EVENT
// ========================================
app.get("/api/events/:id", async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "ID event tidak valid.",
      });
    }

    const [rows] = await db.query(
      `SELECT
        id,
        title,
        description,
        image_url,
        category,
        location,
        event_date,
        end_date,
        ticket_price,
        total_seats,
        available_seats,
        status
      FROM events
      WHERE id = ? AND status = 'published'`,
      [eventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Event tidak ditemukan.",
      });
    }

    res.json({
      status: "success",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching event:", error.message);

    res.status(500).json({
      status: "error",
      message: "Gagal mengambil detail event.",
    });
  }
});

// ========================================
// 8. REGISTRASI CUSTOMER
// ========================================

app.post("/api/auth/register", async (req, res) => {
  let connection;

  try {
    const { name, email, password, role, referral_code } = req.body;

    // 1. Validasi input wajib
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Nama, email, dan password wajib diisi.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      (role !== undefined && typeof role !== "string") ||
      (referral_code !== undefined &&
        referral_code !== null &&
        typeof referral_code !== "string")
    ) {
      return res.status(400).json({
        status: "error",
        message: "Format input tidak valid.",
      });
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const referralCode = referral_code?.trim().toUpperCase() || null;

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        status: "error",
        message: "Nama harus terdiri dari 2–100 karakter.",
      });
    }

    if (
      normalizedEmail.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Format email tidak valid.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        status: "error",
        message: "Password harus terdiri dari 8–72 karakter.",
      });
    }

    // 2. Registrasi publik hanya untuk customer
    if (role && role !== "customer") {
      return res.status(403).json({
        status: "error",
        message: "Registrasi publik hanya tersedia untuk customer.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 3. Periksa email duplikat
    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        status: "error",
        message: "Email sudah terdaftar.",
      });
    }

    // 4. Validasi dan kunci kode referral agar tidak dipakai bersamaan
    let referrerId = null;

    if (referralCode) {
      const [referrers] = await connection.query(
        `SELECT id, referral_used
         FROM users
         WHERE referral_code = ?
           AND role = 'customer'
         FOR UPDATE`,
        [referralCode]
      );

      if (referrers.length === 0) {
        await connection.rollback();

        return res.status(400).json({
          status: "error",
          message: "Kode referral tidak valid.",
        });
      }

      const referrer = referrers[0];

      if (Number(referrer.referral_used) === 1) {
        await connection.rollback();

        return res.status(400).json({
          status: "error",
          message: "Kode referral ini sudah pernah digunakan.",
        });
      }

      referrerId = referrer.id;
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Buat kode referral pribadi yang unik
    const crypto = require("crypto");
    let newReferralCode;
    let isUnique = false;

    while (!isUnique) {
      newReferralCode =
        "EVT" + crypto.randomBytes(5).toString("hex").toUpperCase();

      const [existingCodes] = await connection.query(
        "SELECT id FROM users WHERE referral_code = ?",
        [newReferralCode]
      );

      isUnique = existingCodes.length === 0;
    }

    
    // 7. Daftarkan Customer baru
    const [result] = await connection.query(
      `INSERT INTO users
        (name, email, password, role, referral_code, referred_by)
       VALUES (?, ?, ?, 'customer', ?, ?)`,
      [
        cleanName,
        normalizedEmail,
        hashedPassword,
        newReferralCode,
        referrerId,
      ]
    );

    const newCustomerId = result.insertId;

    // 8. Jika menggunakan referral, buat kupon pribadi untuk Customer baru
    if (referrerId !== null) {
      let referralCouponCode;
      let couponCodeIsUnique = false;

      while (!couponCodeIsUnique) {
        referralCouponCode =
          "WELCOME" +
          crypto.randomBytes(5).toString("hex").toUpperCase();

        const [existingCoupons] = await connection.query(
          "SELECT id FROM coupons WHERE code = ?",
          [referralCouponCode]
        );

        couponCodeIsUnique = existingCoupons.length === 0;
      }

      // Kupon diskon 5%, maksimal Rp50.000, satu kali pakai,
      // berlaku selama 3 bulan dan hanya untuk Customer ini.
      await connection.query(
        `INSERT INTO coupons (
          user_id,
          code,
          discount_type,
          discount_value,
          max_discount,
          min_purchase,
          usage_limit,
          used_count,
          starts_at,
          ends_at,
          is_active
        )
        VALUES (
          ?, ?, 'percentage', 5, 50000, 0, 1, 0,
          NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH), 1
        )`,
        [newCustomerId, referralCouponCode]
      );

      // 9. Berikan 10.000 poin kepada pemilik kode referral
      await connection.query(
        `UPDATE users
         SET points = points + 10000
         WHERE id = ?
           AND role = 'customer'`,
        [referrerId]
      );

      // Catat poin dengan masa berlaku 3 bulan
      await connection.query(
        `INSERT INTO point_transactions
          (user_id, points, remaining_points, source, created_at, expires_at)
         VALUES (
           ?, 10000, 10000, 'referral',
           NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH)
         )`,
        [referrerId]
      );

      // Tandai kode referral pengundang sudah digunakan
      await connection.query(
        `UPDATE users
         SET referral_used = 1
         WHERE id = ?`,
        [referrerId]
      );
    }

    await connection.commit();

    return res.status(201).json({
      status: "success",
      message: "Registrasi berhasil.",
      data: {
        id: newCustomerId,
        name: cleanName,
        email: normalizedEmail,
        role: "customer",
        referral_code: newReferralCode,
        referred_by: referrerId,
      },
    });

  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    console.error("Register error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message: "Email atau kode referral sudah digunakan.",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Registrasi gagal. Silakan coba kembali.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/* ========================================
   REGISTER ORGANIZER - KHUSUS
======================================== */

app.post("/api/auth/register-organizer", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi input
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: "error",
        message: "Nama, email, dan password wajib diisi.",
      });
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        status: "error",
        message: "Nama harus terdiri dari 2–100 karakter.",
      });
    }

    if (
      normalizedEmail.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Format email tidak valid.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        status: "error",
        message: "Password harus terdiri dari 8–72 karakter.",
      });
    }

    // Periksa email duplikat
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Email sudah terdaftar.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Simpan Organizer
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, 'organizer')`,
      [cleanName, normalizedEmail, hashedPassword]
    );

    return res.status(201).json({
      status: "success",
      message: "Akun Organizer berhasil dibuat.",
      data: {
        id: result.insertId,
        name: cleanName,
        email: normalizedEmail,
        role: "organizer",
      },
    });

  } catch (error) {
    console.error("Register Organizer error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message: "Email sudah terdaftar.",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Gagal membuat akun Organizer.",
    });
  }
});


// ========================================
// 9. LOGIN DAN PEMBUATAN JWT
// ========================================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: "error",
        message: "Email dan password wajib diisi.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await db.query(
      `SELECT id, name, email, password, role
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Email atau password salah.",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Email atau password salah.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET belum dikonfigurasi.");

      return res.status(500).json({
        status: "error",
        message: "Konfigurasi autentikasi belum tersedia.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        issuer: "evently-api",
        audience: "evently-client",
      }
    );

    return res.json({
      status: "success",
      message: "Login berhasil.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Login gagal. Silakan coba kembali.",
    });
  }
});
// ========================================

// ========================================
// GET ALL USERS - ADMIN ONLY
// ========================================

app.get(
  "/api/users",
  verifyToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { role } = req.query;

      let sql = `
        SELECT id, name, email, phone, role, created_at
        FROM users
      `;

      const params = [];

      if (role) {
        sql += ` WHERE role = ?`;
        params.push(role);
      }

      sql += ` ORDER BY created_at DESC`;

      const [users] = await db.query(sql, params);

      return res.status(200).json({
        status: "success",
        total: users.length,
        data: users,
      });
    } catch (error) {
      console.error("Get all users error:", error);

      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil data pengguna.",
      });
    }
  }
);
// ========================================
// 10. CONTOH ENDPOINT KHUSUS ORGANIZER
// ========================================
// Endpoint ini hanya untuk menguji middleware.
// Belum membuat atau mengubah event di database.

/* ========================================
   ORGANIZER DASHBOARD STATISTICS
======================================== */

app.get(
  "/api/organizer/dashboard",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;

      const [rows] = await db.query(
        `SELECT
          (
            SELECT COUNT(*)
            FROM events
            WHERE organizer_id = ?
          ) AS total_events,

          (
            SELECT COALESCE(SUM(t.ticket_quantity), 0)
            FROM transactions t
            JOIN events e ON t.event_id = e.id
            WHERE e.organizer_id = ?
              AND t.status = 'done'
          ) AS tickets_sold,

          (
            SELECT COUNT(*)
            FROM transactions t
            JOIN events e ON t.event_id = e.id
            WHERE e.organizer_id = ?
          ) AS total_transactions,

          (
            SELECT COUNT(DISTINCT t.customer_id)
            FROM transactions t
            JOIN events e ON t.event_id = e.id
            WHERE e.organizer_id = ?
              AND t.status = 'done'
          ) AS total_attendees,

          (
            SELECT COALESCE(SUM(t.total_amount), 0)
            FROM transactions t
            JOIN events e ON t.event_id = e.id
            WHERE e.organizer_id = ?
              AND t.status = 'done'
          ) AS total_revenue
        `,
        [
          organizerId,
          organizerId,
          organizerId,
          organizerId,
          organizerId,
        ]
      );

      return res.status(200).json({
        status: "success",
        message: "Statistik organizer berhasil diambil.",
        data: {
          total_events: Number(rows[0].total_events),
          tickets_sold: Number(rows[0].tickets_sold),
          total_transactions: Number(rows[0].total_transactions),
          total_attendees: Number(rows[0].total_attendees),
          total_revenue: Number(rows[0].total_revenue),
        },
      });
    } catch (error) {
      console.error("Organizer dashboard statistics error:", error);

      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil statistik dashboard organizer.",
      });
    }
  }
);


 // ========================================
// CREATE EVENT - KHUSUS ORGANIZER
// ========================================
app.post(
  "/api/events",
  verifyToken,
  authorizeRole("organizer"),
  uploadEventImage.single("image"),
  async (req, res) => {
    try {
      const imageUrl = req.file
  ? `/uploads/${req.file.filename}`
  : null;
      const {
        title,
        description,
        category,
        location,
        event_date,
        event_type,
        end_date,
        ticket_price,
        total_seats,
      } = req.body;

      // Validasi input wajib
      if (
        !title ||
        !description ||
        !category ||
        !location ||
        !event_date ||
        ticket_price === undefined ||
        total_seats === undefined
      ) {
        return res.status(400).json({
          status: "error",
          message: "Semua data wajib harus diisi.",
        });
      }

      // Validasi tipe data
      if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof category !== "string" ||
        typeof location !== "string"
      ) {
        return res.status(400).json({
          status: "error",
          message: "Format data event tidak valid.",
        });
      }

      const cleanTitle = title.trim();
      const cleanDescription = description.trim();
      const cleanCategory = category.trim();
      const cleanLocation = location.trim();
      const eventType = event_type;

if (!["free", "paid"].includes(eventType)) {
  return res.status(400).json({
    status: "error",
    message: "Jenis event harus free atau paid.",
  });
}

const price =
  eventType === "free" ? 0 : Number(ticket_price);
      const seats = Number(total_seats);
      const eventDate = new Date(event_date);
      const endDate = end_date ? new Date(end_date) : null;

      if (
        !cleanTitle ||
        cleanTitle.length > 150 ||
        !cleanDescription ||
        !cleanCategory ||
        cleanCategory.length > 100 ||
        !cleanLocation ||
        cleanLocation.length > 255
      ) {
        return res.status(400).json({
          status: "error",
          message: "Judul, deskripsi, kategori, atau lokasi tidak valid.",
        });
      }

      if (
  !Number.isFinite(price) ||
  (eventType === "paid" && price <= 0) ||
  !Number.isSafeInteger(seats) ||
  seats <= 0
)
      {
        return res.status(400).json({
          status: "error",
          message: "Harga harus nonnegatif dan jumlah kursi harus positif.",
        });
      }

      if (
        Number.isNaN(eventDate.getTime()) ||
        (endDate && Number.isNaN(endDate.getTime()))
      ) {
        return res.status(400).json({
          status: "error",
          message: "Format tanggal event tidak valid.",
        });
      }

      if (endDate && endDate < eventDate) {
        return res.status(400).json({
          status: "error",
          message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
        });
      }

      // Organizer ID berasal dari token JWT yang sudah diverifikasi.
      const organizerId = req.user.id;

      const [result] = await db.query(
        `INSERT INTO events (
  organizer_id,
  title,
  description,
  image_url,
  category,
  location,
  event_date,
  end_date,
  event_type,
  ticket_price,
  total_seats,
  available_seats,
  status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
[
  organizerId,
  cleanTitle,
  cleanDescription,
  imageUrl,
  cleanCategory,
  cleanLocation,
  eventDate,
  endDate,
  eventType,
  price,
  seats,
  seats,
]
 );
      return res.status(201).json({
        status: "success",
        message: "Event berhasil dibuat sebagai draft.",
        data: {
          id: result.insertId,
          organizer_id: organizerId,
          title: cleanTitle,
          description: cleanDescription,
          image_url: imageUrl,
          category: cleanCategory,
          location: cleanLocation,
          event_date: eventDate,
          end_date: endDate,
          event_type: eventType,
          ticket_price: price,
          total_seats: seats,
          available_seats: seats,
          status: "draft",
        },
      });
    } catch (error) {
      console.error("Create event error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Gagal membuat event.",
      });
    }
  }
);


// ========================================
// 11. CONTOH ENDPOINT KHUSUS CUSTOMER
// ========================================
app.get(
  "/api/customer/dashboard",
  verifyToken,
  authorizeRole("customer"),
  (req, res) => {
    res.json({
      status: "success",
      message: "Akses dashboard customer berhasil.",
      user: req.user,
    });
  }
);

app.get(
  "/api/customer/referral",
  verifyToken,
  authorizeRole("customer"),
  async (req, res) => {
    try {
      // Ambil data customer yang sedang login
      const [users] = await db.query(
        `SELECT id, name, referral_code, points
         FROM users
         WHERE id = ? AND role = 'customer'`,
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Data customer tidak ditemukan.",
        });
      }

      const customer = users[0];
// Ambil seluruh kupon personal milik Customer yang sedang login
const [coupons] = await db.query(
  `SELECT
    id,
    code,
    discount_type,
    discount_value,
    max_discount,
    min_purchase,
    usage_limit,
    used_count,
    starts_at,
    ends_at,
    is_active,
    CASE
      WHEN is_active = 0 THEN 'inactive'
      WHEN starts_at IS NOT NULL AND starts_at > NOW() THEN 'upcoming'
      WHEN ends_at IS NOT NULL AND ends_at < NOW() THEN 'expired'
      WHEN usage_limit IS NOT NULL AND used_count >= usage_limit THEN 'used'
      ELSE 'available'
    END AS coupon_status
   FROM coupons
   WHERE user_id = ?
   ORDER BY created_at DESC`,
  [req.user.id]
);

      // Buat kode referral jika akun lama belum memilikinya
      let referralCode = customer.referral_code;

      if (!referralCode) {
        const crypto = require("crypto");
        let isUnique = false;

        while (!isUnique) {
          referralCode =
            "EVT" + crypto.randomBytes(5).toString("hex").toUpperCase();

          const [existingCodes] = await db.query(
            "SELECT id FROM users WHERE referral_code = ?",
            [referralCode]
          );

          isUnique = existingCodes.length === 0;
        }

        await db.query(
          `UPDATE users
           SET referral_code = ?
           WHERE id = ? AND referral_code IS NULL`,
          [referralCode, req.user.id]
        );

        // Ambil ulang kode jika akun berubah secara bersamaan
        const [updatedUsers] = await db.query(
          "SELECT referral_code, points FROM users WHERE id = ?",
          [req.user.id]
        );

        referralCode = updatedUsers[0].referral_code;
      }

      return res.status(200).json({
        status: "success",
       data: {
  name: customer.name,
  referral_code: referralCode,
  points: customer.points,
  coupons,
},
      });
    } catch (error) {
      console.error("Referral endpoint error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil data referral.",
      });
    }
  }
);

 // ========================================
// READ EVENT - DAFTAR EVENT MILIK ORGANIZER
// ========================================
app.get(
  "/api/organizer/events",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;

      const [rows] = await db.query(
        `SELECT
          id,
          title,
          description,
          category,
          location,
          event_date,
          end_date,
          ticket_price,
          total_seats,
          available_seats,
          status,
          created_at
        FROM events
        WHERE organizer_id = ?
        ORDER BY created_at DESC`,
        [organizerId]
      );

      return res.json({
        status: "success",
        message: "Daftar event organizer berhasil diambil.",
        data: rows,
      });
    } catch (error) {
      console.error("Get organizer events error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil daftar event organizer.",
      });
    }
  }
);

 // ========================================
// UPDATE EVENT - KHUSUS PEMILIK EVENT
// ========================================
app.put(
  "/api/organizer/events/:id",
  verifyToken,
  authorizeRole("organizer"),
  uploadEventImage.single("image"),
  async (req, res) => {
    try {
      const eventId = Number(req.params.id);
      const organizerId = req.user.id;
const imageUrl = req.file
  ? `/uploads/${req.file.filename}`
  : undefined;
      if (!Number.isInteger(eventId) || eventId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "ID event tidak valid.",
        });
      }

      const {
        title,
        description,
        category,
        location,
        event_date,
        end_date,
        event_type,
        ticket_price,
        total_seats,
        status,
      } = req.body;

      if (
        !title ||
        !description ||
        !category ||
        !location ||
        !event_date ||
        ticket_price === undefined ||
        total_seats === undefined
      ) {
        return res.status(400).json({
          status: "error",
          message: "Semua data wajib harus diisi.",
        });
      }

      if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof category !== "string" ||
        typeof location !== "string"
      ) {
        return res.status(400).json({
          status: "error",
          message: "Format data event tidak valid.",
        });
      }

      const cleanTitle = title.trim();
      const cleanDescription = description.trim();
      const cleanCategory = category.trim();
      const cleanLocation = location.trim();
      const eventType = event_type;

if (!["free", "paid"].includes(eventType)) {
  return res.status(400).json({
    status: "error",
    message: "Jenis event harus free atau paid.",
  });
}

const price =
  eventType === "free" ? 0 : Number(ticket_price);
      const seats = Number(total_seats);
      const eventDate = new Date(event_date);
      const endDate = end_date ? new Date(end_date) : null;

      if (
        !cleanTitle ||
        cleanTitle.length > 150 ||
        !cleanDescription ||
        !cleanCategory ||
        cleanCategory.length > 100 ||
        !cleanLocation ||
        cleanLocation.length > 255 ||
        !Number.isFinite(price) ||
(eventType === "paid" && price <= 0) ||
        !Number.isSafeInteger(seats) ||
        seats <= 0 ||
        Number.isNaN(eventDate.getTime()) ||
        (endDate && Number.isNaN(endDate.getTime()))
      ) {
        return res.status(400).json({
          status: "error",
          message: "Data event tidak valid.",
        });
      }

      if (endDate && endDate < eventDate) {
        return res.status(400).json({
          status: "error",
          message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
        });
      }

      if (
        status !== undefined &&
        !["draft", "published", "cancelled"].includes(status)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Status event tidak valid.",
        });
      }

      // Pastikan event ada dan dimiliki organizer yang login.
      const [events] = await db.query(
        `SELECT id, available_seats, total_seats
         FROM events
         WHERE id = ? AND organizer_id = ?`,
        [eventId, organizerId]
      );

      if (events.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Event tidak ditemukan atau bukan milik Anda.",
        });
      }

      const currentEvent = events[0];
      const seatsSold =
        Number(currentEvent.total_seats) -
        Number(currentEvent.available_seats);

      if (seats < seatsSold) {
        return res.status(400).json({
          status: "error",
          message: "Jumlah kursi tidak boleh lebih sedikit daripada tiket yang sudah terjual.",
        });
      }

      const newAvailableSeats = seats - seatsSold;
      const newStatus = status ?? "draft";

      await db.query(
       `UPDATE events
 SET title = ?,
     description = ?,
     image_url = COALESCE(?, image_url),
     category = ?,
     location = ?,
     event_date = ?,
     end_date = ?,
     event_type = ?,
     ticket_price = ?,
     total_seats = ?,
     available_seats = ?,
     status = ?
 WHERE id = ? AND organizer_id = ?`,
        [
  cleanTitle,
  cleanDescription,
  imageUrl ?? null, // TAMBAHAN: untuk image_url
  cleanCategory,
  cleanLocation,
  eventDate,
  endDate,
  eventType,
  price,
  seats,
  newAvailableSeats,
  newStatus,
  eventId,
  organizerId,
]
      );

      return res.json({
        status: "success",
        message: "Event berhasil diperbarui.",
      });
    } catch (error) {
      console.error("Update event error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Gagal memperbarui event.",
      });
    }
  }
);

/* DELETE EVENT - Organizer hanya bisa menghapus event miliknya */

app.delete(
  "/api/organizer/events/:id",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const eventId = req.params.id;
      const organizerId = req.user.id;

      // Periksa apakah event milik organizer yang sedang login
      const [events] = await db.query(
        "SELECT id FROM events WHERE id = ? AND organizer_id = ?",
        [eventId, organizerId]
      );

      if (events.length === 0) {
        return res.status(404).json({
          message: "Event tidak ditemukan atau bukan milik Anda.",
        });
      }

      // Hapus event
      await db.query(
        "DELETE FROM events WHERE id = ? AND organizer_id = ?",
        [eventId, organizerId]
      );

      return res.status(200).json({
        message: "Event berhasil dihapus.",
      });
    } catch (error) {
      console.error("Delete event error:", error);

      return res.status(500).json({
        message: "Terjadi kesalahan saat menghapus event.",
      });
    }
  }
);

/* ========================================
   CREATE TRANSACTION - CUSTOMER
======================================== */

/* ========================================
   VALIDATE COUPON - CUSTOMER
======================================== */
app.post(
  "/api/coupons/validate",
  verifyToken,
  authorizeRole("customer"),
  async (req, res) => {
    try {
      const { event_id, ticket_quantity, coupon_code, points_to_use = 0 } = req.body;

      const eventId = Number(event_id);
      const quantity = Number(ticket_quantity);

      if (
        !Number.isInteger(eventId) ||
        eventId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        typeof coupon_code !== "string" ||
        !coupon_code.trim()
      ) {
        return res.status(400).json({
          message: "Event, jumlah tiket, dan kode kupon wajib valid.",
        });
      }

      const normalizedCode = coupon_code.trim().toUpperCase();

      const [events] = await db.query(
        `SELECT id, ticket_price, available_seats, status
         FROM events
         WHERE id = ?`,
        [eventId]
      );

      if (
        events.length === 0 ||
        events[0].status !== "published"
      ) {
        return res.status(404).json({
          message: "Event tidak ditemukan atau belum dipublikasikan.",
        });
      }

      const event = events[0];

      if (Number(event.available_seats) < quantity) {
        return res.status(400).json({
          message: "Jumlah tiket melebihi kursi yang tersedia.",
        });
      }

      const subtotal = Number(
        (Number(event.ticket_price) * quantity).toFixed(2)
      );

      const [coupons] = await db.query(
        `
SELECT
  id,
  code,
  discount_type,
  discount_value,
  max_discount,
  min_purchase,
  usage_limit,
  used_count,
  starts_at,
  ends_at,
  is_active
FROM coupons
WHERE code = ?
  AND (event_id IS NULL OR event_id = ?)
  AND (user_id IS NULL OR user_id = ?)
LIMIT 1`,
        [normalizedCode, eventId, req.user.id]
      );

      if (coupons.length === 0) {
        return res.status(400).json({
          message: "Kode kupon tidak ditemukan.",
        });
      }

      const coupon = coupons[0];

      if (Number(coupon.is_active) !== 1) {
        return res.status(400).json({
          message: "Kupon sedang tidak aktif.",
        });
      }

      // Bandingkan waktu menggunakan waktu server/database.
      const [timeRows] = await db.query(
        "SELECT NOW() AS db_now"
      );

      const now = new Date(timeRows[0].db_now);

      if (
        coupon.starts_at &&
        now < new Date(coupon.starts_at)
      ) {
        return res.status(400).json({
          message: "Kupon belum mulai berlaku.",
        });
      }

      if (
        coupon.ends_at &&
        now > new Date(coupon.ends_at)
      ) {
        return res.status(400).json({
          message: "Masa berlaku kupon sudah berakhir.",
        });
      }

      if (
        coupon.usage_limit !== null &&
        Number(coupon.used_count) >= Number(coupon.usage_limit)
      ) {
        return res.status(400).json({
          message: "Kupon sudah mencapai batas pemakaian.",
        });
      }

      if (subtotal < Number(coupon.min_purchase)) {
        return res.status(400).json({
          message: "Total pembelian belum memenuhi minimum kupon.",
          min_purchase: Number(coupon.min_purchase),
        });
      }

      let discountAmount;

      if (coupon.discount_type === "percentage") {
        discountAmount =
          subtotal * Number(coupon.discount_value) / 100;

        if (coupon.max_discount !== null) {
          discountAmount = Math.min(
            discountAmount,
            Number(coupon.max_discount)
          );
        }
      } else {
        discountAmount = Number(coupon.discount_value);
      }

      discountAmount = Number(
        Math.min(subtotal, discountAmount).toFixed(2)
      );

      const totalAmount = Number(
        Math.max(0, subtotal - discountAmount).toFixed(2)
      );

      return res.status(200).json({
        status: "success",
        message: "Kupon valid.",
        data: {
          id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: Number(coupon.discount_value),
          max_discount:
            coupon.max_discount === null
              ? null
              : Number(coupon.max_discount),
          min_purchase: Number(coupon.min_purchase),
          subtotal,
          discount_amount: discountAmount,
          total_amount: totalAmount,
        },
      });
    } catch (error) {
      console.error("Validate coupon error:", error);

      return res.status(500).json({
        message: "Terjadi kesalahan saat memvalidasi kupon.",
      });
    }
  }
);

/* ========================================
   CREATE TRANSACTION - CUSTOMER + COUPON
======================================== */
app.post(
  "/api/transactions",
  verifyToken,
  authorizeRole("customer"),
  async (req, res) => {
    let connection;

    try {
      const customerId = req.user.id;
      const {
  event_id,
  ticket_quantity,
  coupon_code,
  points_to_use = 0,
} = req.body;

      const eventId = Number(event_id);
      const quantity = Number(ticket_quantity);

      // 1. Validasi event dan jumlah tiket
      if (
        !Number.isInteger(eventId) ||
        eventId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message:
            "Event ID dan jumlah tiket harus berupa bilangan bulat positif.",
        });
      }

      // 2. Validasi format kode kupon
      if (
        coupon_code !== undefined &&
        coupon_code !== null &&
        typeof coupon_code !== "string"
      ) {
        return res.status(400).json({
          message: "Format kode kupon tidak valid.",
        });
      }

      const couponCode = coupon_code?.trim().toUpperCase() || null;

      // Validasi jumlah poin yang ingin digunakan
const requestedPoints = Number(points_to_use);

if (
  !Number.isInteger(requestedPoints) ||
  requestedPoints < 0
) {
  return res.status(400).json({
    message: "Jumlah poin harus berupa bilangan bulat positif atau nol.",
  });
}

      if (couponCode && couponCode.length > 50) {
        return res.status(400).json({
          message: "Kode kupon maksimal 50 karakter.",
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      // 3. Ambil dan kunci data event
      const [events] = await connection.query(
        `SELECT
           id,
           title,
           event_type,
           ticket_price,
           available_seats,
           status
         FROM events
         WHERE id = ?
         FOR UPDATE`,
        [eventId]
      );

      if (
        events.length === 0 ||
        events[0].status !== "published"
      ) {
        await connection.rollback();

        return res.status(404).json({
          message: "Event tidak ditemukan atau belum dipublikasikan.",
        });
      }

      const event = events[0];
      const isFreeEvent = event.event_type === "free";

// FREE EVENT tidak boleh menggunakan kupon atau poin.
if (isFreeEvent && (couponCode || requestedPoints > 0)) {
  await connection.rollback();

  return res.status(400).json({
    message: "FREE EVENT tidak menggunakan kupon atau poin.",
  });
}

      if (Number(event.available_seats) < quantity) {
        await connection.rollback();

        return res.status(400).json({
          message: "Jumlah tiket melebihi kursi yang tersedia.",
          available_seats: Number(event.available_seats),
        });
      }

      // 4. Hitung harga awal dari database
      const ticketPrice = Number(event.ticket_price);
      const subtotal = Number((ticketPrice * quantity).toFixed(2));

      let couponId = null;
      let appliedCouponCode = null;
      let discountAmount = 0;

      // 5. Validasi dan hitung kupon jika diisi
      if (couponCode) {
        const [coupons] = await connection.query(
          `SELECT
             id,
             code,
             discount_type,
             discount_value,
             max_discount,
             min_purchase,
             usage_limit,
             used_count,
             starts_at,
             ends_at,
             is_active
           FROM coupons
WHERE code = ?
  AND (event_id IS NULL OR event_id = ?)
  AND (user_id IS NULL OR user_id = ?)
FOR UPDATE`,
          [couponCode, eventId, customerId]
        );

        if (coupons.length === 0) {
          await connection.rollback();

          return res.status(400).json({
            message: "Kode kupon tidak ditemukan.",
          });
        }

        const coupon = coupons[0];
        const now = new Date();

        if (Number(coupon.is_active) !== 1) {
          await connection.rollback();

          return res.status(400).json({
            message: "Kupon sedang tidak aktif.",
          });
        }

        if (
          coupon.starts_at &&
          now < new Date(coupon.starts_at)
        ) {
          await connection.rollback();

          return res.status(400).json({
            message: "Kupon belum mulai berlaku.",
          });
        }

        if (
          coupon.ends_at &&
          now > new Date(coupon.ends_at)
        ) {
          await connection.rollback();

          return res.status(400).json({
            message: "Masa berlaku kupon sudah berakhir.",
          });
        }

        if (
          coupon.usage_limit !== null &&
          Number(coupon.used_count) >= Number(coupon.usage_limit)
        ) {
          await connection.rollback();

          return res.status(400).json({
            message: "Kupon sudah mencapai batas pemakaian.",
          });
        }

        if (subtotal < Number(coupon.min_purchase)) {
          await connection.rollback();

          return res.status(400).json({
            message: "Total pembelian belum memenuhi minimum kupon.",
            min_purchase: Number(coupon.min_purchase),
          });
        }

        // Diskon persentase atau nominal tetap
        if (coupon.discount_type === "percentage") {
          discountAmount =
            subtotal * Number(coupon.discount_value) / 100;

          if (coupon.max_discount !== null) {
            discountAmount = Math.min(
              discountAmount,
              Number(coupon.max_discount)
            );
          }
        } else {
          discountAmount = Number(coupon.discount_value);
        }

        // Diskon tidak boleh melebihi subtotal
        discountAmount = Number(
          Math.min(subtotal, discountAmount).toFixed(2)
        );

        couponId = coupon.id;
        appliedCouponCode = coupon.code;
      }

      // 6. Hitung total setelah diskon kupon
const totalAfterCoupon = Number(
  Math.max(0, subtotal - discountAmount).toFixed(2)
);

// 7. Ambil saldo poin Customer dan kunci datanya
await connection.query(
  `SELECT id, points
   FROM users
   WHERE id = ?
   FOR UPDATE`,
  [customerId]
);

// Ambil poin yang belum kedaluwarsa
const [pointLots] = await connection.query(
  `SELECT id, remaining_points, expires_at
   FROM point_transactions
   WHERE user_id = ?
     AND remaining_points > 0
     AND expires_at > NOW()
   ORDER BY expires_at ASC, created_at ASC
   FOR UPDATE`,
  [customerId]
);

// Hitung total poin aktif
const availablePoints = pointLots.reduce(
  (total, lot) => total + Number(lot.remaining_points),
  0
);


// Validasi aturan penukaran poin di backend
if (requestedPoints > 0) {
  // Minimal penukaran 1.000 poin
  if (requestedPoints < 1000) {
    await connection.rollback();

    return res.status(400).json({
      message: "Minimal penukaran adalah 1.000 poin.",
    });
  }

  // Penukaran harus kelipatan 1.000
  if (requestedPoints % 1000 !== 0) {
    await connection.rollback();

    return res.status(400).json({
      message: "Penukaran poin harus dalam kelipatan 1.000.",
    });
  }

  // Tidak boleh melebihi saldo poin aktif
  if (requestedPoints > availablePoints) {
    await connection.rollback();

    return res.status(400).json({
      message: "Saldo poin aktif Anda tidak mencukupi.",
      available_points: availablePoints,
    });
  }

  // Tidak boleh melebihi total tagihan setelah diskon kupon
  if (requestedPoints > totalAfterCoupon) {
    await connection.rollback();

    return res.status(400).json({
      message: "Jumlah poin melebihi sisa tagihan.",
      remaining_bill: totalAfterCoupon,
    });
  }
}

// Gunakan persis jumlah poin yang diminta.
// Jangan mengurangi jumlahnya secara otomatis.
const pointsUsed = requestedPoints;


// Hitung total pembayaran setelah penggunaan poin
const totalAmount = Number(
  Math.max(0, totalAfterCoupon - pointsUsed).toFixed(2)
);

// Siapkan pembagian penggunaan poin berdasarkan masa berlaku
let remainingToUse = pointsUsed;
const pointAllocations = [];

for (const lot of pointLots) {
  if (remainingToUse <= 0) break;

  const amount = Math.min(
    Number(lot.remaining_points),
    remainingToUse
  );

  pointAllocations.push({
    point_transaction_id: lot.id,
    points_used: amount,
  });

  remainingToUse -= amount;
}

      // 7. Buat kode booking
      const bookingCode =
        "EVT" +
        Date.now().toString() +
        Math.random().toString(36).substring(2, 7).toUpperCase();

     // Batas pembayaran sementara untuk testing
const paymentDeadline = isFreeEvent
  ? null
  : new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

const transactionStatus = isFreeEvent ? "done" : "waiting_payment";

      // 8. Simpan transaksi beserta informasi kupon
      const [result] = await connection.query(
  `INSERT INTO transactions (
     booking_code,
     event_id,
     customer_id,
     ticket_quantity,
     ticket_price,
     total_amount,
     coupon_id,
     coupon_code,
     discount_amount,
     points_used,
     status,
     payment_deadline
   )
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    bookingCode,
    eventId,
    customerId,
    quantity,
    ticketPrice,
    totalAmount,
    couponId,
    appliedCouponCode,
    discountAmount,
    pointsUsed,
transactionStatus,
paymentDeadline,
  ]
);
// Kurangi saldo poin Customer
if (pointsUsed > 0) {
  await connection.query(
    `UPDATE users
     SET points = GREATEST(points - ?, 0)
     WHERE id = ?`,
    [pointsUsed, customerId]
  );

  // Kurangi poin dari sumber yang paling dekat kedaluwarsa
  for (const allocation of pointAllocations) {
    await connection.query(
      `UPDATE point_transactions
       SET remaining_points = remaining_points - ?
       WHERE id = ?
         AND user_id = ?
         AND remaining_points >= ?`,
      [
        allocation.points_used,
        allocation.point_transaction_id,
        customerId,
        allocation.points_used,
      ]
    );

    // Catat penggunaan poin untuk transaksi ini
    await connection.query(
      `INSERT INTO transaction_point_usage (
         transaction_id,
         point_transaction_id,
         points_used
       )
       VALUES (?, ?, ?)`,
      [
        result.insertId,
        allocation.point_transaction_id,
        allocation.points_used,
      ]
    );
  }
}

      // 9. Catat pemakaian kupon untuk transaksi ini
      if (couponId !== null) {
        await connection.query(
          `UPDATE coupons
           SET used_count = used_count + 1
           WHERE id = ?`,
          [couponId]
        );
      }

      // 10. Kurangi kursi yang tersedia
      await connection.query(
        `UPDATE events
         SET available_seats = available_seats - ?
         WHERE id = ?`,
        [quantity, eventId]
      );
// FREE EVENT: langsung buat tiket QR tanpa menunggu Organizer.
if (isFreeEvent) {
  for (let i = 1; i <= quantity; i++) {
    const randomToken = crypto.randomBytes(32).toString("hex");

    const ticketCode =
      `EVT-${result.insertId}-${i}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    await connection.query(
      `INSERT INTO tickets
        (transaction_id, customer_id, event_id, ticket_code, qr_token, status)
       VALUES (?, ?, ?, ?, ?, 'valid')`,
      [
        result.insertId,
        customerId,
        eventId,
        ticketCode,
        randomToken,
      ]
    );
  }

  console.log(
    `${quantity} tiket FREE EVENT berhasil dibuat untuk transaksi ${result.insertId}`
  );
}

// Ambil data Customer untuk kebutuhan email notifikasi
const [customerRows] = await connection.query(
  `SELECT name, email
   FROM users
   WHERE id = ?
   LIMIT 1`,
  [customerId]
);

const customer = customerRows[0];
// Kirim email konfirmasi pemesanan
// Saat development, email diarahkan ke Gmail pengujian.
if (customer) {
  const emailTujuan =
    process.env.NODE_ENV === "production"
      ? customer.email
      : process.env.EMAIL_USER;

  try {
    await sendEmail({
      to: emailTujuan,
      subject: isFreeEvent
  ? "Registrasi FREE EVENT Berhasil - EVENTLY"
  : "Konfirmasi Pemesanan Tiket - EVENTLY",

html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #333;">
    <h2 style="color: #6366f1;">EVENTLY</h2>

    <h3>Halo, ${customer.name}!</h3>

    ${
      isFreeEvent
        ? `
          <p>
            Selamat! Registrasi kamu untuk event gratis berhasil.
            Tiket elektronik kamu sudah diterbitkan.
          </p>
        `
        : `
          <p>
            Terima kasih telah melakukan pemesanan tiket melalui EVENTLY.
            Pesanan kamu berhasil dibuat.
          </p>
        `
    }

    <div style="background: #f5f5f5; padding: 18px; border-radius: 8px;">
      <h3>Detail Pemesanan</h3>
      <p><strong>Kode Booking:</strong> ${bookingCode}</p>
      <p><strong>Nama Event:</strong> ${event.title}</p>
      <p><strong>Jumlah Tiket:</strong> ${quantity}</p>
      <p>
        <strong>Total:</strong>
        ${isFreeEvent ? "GRATIS" : `Rp ${totalAmount.toLocaleString("id-ID")}`}
      </p>
      <p>
        <strong>Status:</strong>
        ${isFreeEvent ? "Registrasi Berhasil" : "Menunggu Pembayaran"}
      </p>
      ${
        !isFreeEvent
          ? `<p><strong>Batas Pembayaran:</strong> ${paymentDeadline.toLocaleString("id-ID")}</p>`
          : ""
      }
    </div>

    ${
      isFreeEvent
        ? `
          <p>
            Silakan buka menu My Tickets di akun EVENTLY kamu
            untuk melihat tiket elektronik dan QR Code.
          </p>
        `
        : `
          <p>
            Silakan lanjutkan proses pembayaran sebelum batas waktu berakhir.
          </p>
        `
    }

    <p>Terima kasih telah menggunakan EVENTLY!</p>
    <strong>EVENTLY Team</strong>
  </div>
`,
  });

    console.log("Email konfirmasi transaksi berhasil diproses.");
  } catch (emailError) {
    console.error("Gagal mengirim email konfirmasi:", emailError);
  }
}
      await connection.commit();

      return res.status(201).json({
        message: "Transaksi berhasil dibuat.",
        data: {
          id: result.insertId,
          booking_code: bookingCode,
          event_id: eventId,
          event_title: event.title,
          ticket_quantity: quantity,
          ticket_price: ticketPrice,
          subtotal,
          coupon_id: couponId,
          coupon_code: appliedCouponCode,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          status: transactionStatus,
payment_deadline: paymentDeadline,
        },
      });
    } catch (error) {
      if (connection) {
        await connection.rollback().catch(() => {});
      }

      console.error("Create transaction error:", error);

      return res.status(500).json({
        message: "Terjadi kesalahan saat membuat transaksi.",
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);


/* UPLOAD PAYMENT PROOF - CUSTOMER */
app.put(
  "/api/transactions/:id/payment-proof",
  verifyToken,
  authorizeRole("customer"),
  uploadPaymentProof.single("payment_proof"),
  async (req, res) => {
    let connection;

    try {
      const transactionId = Number(req.params.id);
      const customerId = req.user.id;
      const uploadedFile = req.file;

      if (!Number.isInteger(transactionId) || transactionId <= 0) {
        if (uploadedFile) {
          fs.unlinkSync(uploadedFile.path);
        }

        return res.status(400).json({
          message: "ID transaksi tidak valid.",
        });
      }

      if (!uploadedFile) {
        return res.status(400).json({
          message: "Pilih file bukti pembayaran terlebih dahulu.",
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT id, status, payment_deadline
         FROM transactions
         WHERE id = ? AND customer_id = ?
         FOR UPDATE`,
        [transactionId, customerId]
      );

      if (rows.length === 0) {
        await connection.rollback();
        fs.unlinkSync(uploadedFile.path);

        return res.status(404).json({
          message: "Transaksi tidak ditemukan.",
        });
      }

      const transaction = rows[0];

      if (transaction.status !== "waiting_payment") {
        await connection.rollback();
        fs.unlinkSync(uploadedFile.path);

        return res.status(400).json({
          message: "Transaksi tidak sedang menunggu pembayaran.",
        });
      }

      if (new Date(transaction.payment_deadline) <= new Date()) {
        await connection.rollback();
        fs.unlinkSync(uploadedFile.path);

        return res.status(400).json({
          message: "Batas waktu pembayaran telah berakhir.",
        });
      }

      const paymentProofPath = `/uploads/${uploadedFile.filename}`;
     // Batas konfirmasi sementara untuk testing
const confirmationDeadline = new Date(
  Date.now() + CONFIRMATION_TIMEOUT_MINUTES * 60 * 1000
);

      await connection.query(
        `UPDATE transactions
         SET payment_proof = ?,
             status = 'waiting_confirmation',
             confirmation_deadline = ?
         WHERE id = ? AND customer_id = ?`,
        [
          paymentProofPath,
          confirmationDeadline,
          transactionId,
          customerId,
        ]
      );

      await connection.commit();

      return res.status(200).json({
        message: "Bukti pembayaran berhasil diunggah untuk konfirmasi.",
        transaction_id: transactionId,
        payment_proof: paymentProofPath,
        status: "waiting_confirmation",
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Payment proof upload error:", error);

      return res.status(500).json({
        message: "Terjadi kesalahan saat mengunggah bukti pembayaran.",
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);
app.use("/uploads", express.static(uploadDir));

/* GET TRANSACTIONS - ORGANIZER */
app.get(
  "/api/organizer/transactions",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;

      const [transactions] = await db.query(
        `SELECT
          t.id AS transaction_id,
          t.booking_code,
          t.ticket_quantity,
          t.ticket_price,
          t.total_amount,
          t.payment_proof,
          t.status,
          t.payment_deadline,
          t.created_at,
          e.id AS event_id,
          e.title AS event_title,
          u.name AS customer_name,
          u.email AS customer_email
        FROM transactions t
        JOIN events e ON t.event_id = e.id
        JOIN users u ON t.customer_id = u.id
        WHERE e.organizer_id = ?
          AND t.status = 'waiting_confirmation'
        ORDER BY t.created_at DESC`,
        [organizerId]
      );

      return res.status(200).json({
        message: "Daftar transaksi menunggu konfirmasi berhasil diambil.",
        total: transactions.length,
        transactions,
      });
    } catch (error) {
      console.error("Get organizer transactions error:", error);

      return res.status(500).json({
        message: "Terjadi kesalahan saat mengambil daftar transaksi.",
      });
    }
  }
);


/* ACCEPT PAYMENT + REFERRAL POINTS - ORGANIZER */
app.put(
  "/api/organizer/transactions/:id/accept",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    let connection;

    try {
      const transactionId = Number(req.params.id);
      const organizerId = req.user.id;

      if (!Number.isInteger(transactionId) || transactionId <= 0) {
        return res.status(400).json({
          message: "ID transaksi tidak valid.",
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      // Ambil transaksi dan kunci baris agar tidak diproses bersamaan
      const [rows] = await connection.query(
  
  `SELECT
     t.id,
     t.status,
     t.customer_id,
     t.event_id,
     t.booking_code,
     t.ticket_quantity,
     t.total_amount,
     e.organizer_id,
     e.title AS event_title,
     u.name AS customer_name,
     u.email AS customer_email
   FROM transactions t
   JOIN events e ON t.event_id = e.id
   JOIN users u ON t.customer_id = u.id
   WHERE t.id = ?
   FOR UPDATE`,
  [transactionId]
);

      if (rows.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          message: "Transaksi tidak ditemukan.",
        });
      }

      const transaction = rows[0];

      if (Number(transaction.organizer_id) !== Number(organizerId)) {
        await connection.rollback();

        return res.status(403).json({
          message: "Kamu tidak berhak memproses transaksi ini.",
        });
      }

      if (transaction.status !== "waiting_confirmation") {
        await connection.rollback();

        return res.status(400).json({
          message: "Transaksi tidak sedang menunggu konfirmasi.",
        });
      }

      // Ubah status transaksi menjadi done
const [updateResult] = await connection.query(
  `UPDATE transactions
   SET status = 'done'
   WHERE id = ?
     AND status = 'waiting_confirmation'`,
  [transactionId]
);

if (updateResult.affectedRows !== 1) {
  throw new Error(
    "Status transaksi gagal diperbarui menjadi done."
  );
}

// Buat QR Code unik untuk setiap tiket
for (let i = 1; i <= Number(transaction.ticket_quantity); i++) {
  const randomToken = crypto.randomBytes(32).toString("hex");

  const ticketCode =
    `EVT-${transaction.id}-${i}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  await connection.query(
    `INSERT INTO tickets
      (transaction_id, customer_id, event_id, ticket_code, qr_token, status)
     VALUES (?, ?, ?, ?, ?, 'valid')`,
    [
      transaction.id,
      transaction.customer_id,
      transaction.event_id,
      ticketCode,
      randomToken,
    ]
  );
}

console.log(
  `${transaction.ticket_quantity} tiket berhasil dibuat untuk transaksi ${transaction.id}`
);

      await connection.commit();
// Kirim email konfirmasi pembayaran berhasil
const emailTujuan =
  process.env.NODE_ENV === "production"
    ? transaction.customer_email
    : process.env.EMAIL_USER;

const emailResult = await sendEmail({
  to: emailTujuan,
  subject: "Pembayaran Berhasil - EVENTLY",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #333;">
      <h2 style="color: #6366f1;">EVENTLY</h2>

      <h3>Halo, ${transaction.customer_name}!</h3>

      <p>
        Kabar baik! Pembayaran tiket kamu telah dikonfirmasi
        oleh Organizer.
      </p>

      <div style="background: #f5f5f5; padding: 18px; border-radius: 8px;">
        <h3>Detail Transaksi</h3>
        <p><strong>Kode Booking:</strong> ${transaction.booking_code}</p>
        <p><strong>Nama Event:</strong> ${transaction.event_title}</p>
        <p><strong>Jumlah Tiket:</strong> ${transaction.ticket_quantity}</p>
        <p><strong>Total Pembayaran:</strong> Rp ${Number(transaction.total_amount).toLocaleString("id-ID")}</p>
        <p><strong>Status:</strong> Pembayaran Berhasil</p>
      </div>

      <p>
        Terima kasih telah menggunakan EVENTLY.
        Sampai bertemu di acara!
      </p>

      <strong>EVENTLY Team</strong>
    </div>
  `,
});

if (emailResult.success) {
  console.log("Email konfirmasi pembayaran berhasil dikirim.");
} else {
  console.error("Email konfirmasi pembayaran gagal:", emailResult.error);
}
      return res.status(200).json({
  message: "Pembayaran berhasil dikonfirmasi.",
  transaction_id: transactionId,
  status: "done",
});
    } catch (error) {
      if (connection) {
        await connection.rollback().catch(() => {});
      }

      console.error("Accept payment error:", error);

      return res.status(500).json({
        message: "Terjadi kesalahan saat mengonfirmasi pembayaran.",
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);


/* REJECT PAYMENT - ORGANIZER */
app.put(
  "/api/organizer/transactions/:id/reject",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    let connection;

    try {
      const transactionId = Number(req.params.id);
      const organizerId = req.user.id;

      if (!Number.isInteger(transactionId) || transactionId <= 0) {
        return res.status(400).json({
          message: "ID transaksi tidak valid.",
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT
           t.id,
           t.event_id,
           t.customer_id,
           t.ticket_quantity,
           t.points_used,
           t.coupon_id,
           t.status,
           e.organizer_id
         FROM transactions t
         JOIN events e ON t.event_id = e.id
         WHERE t.id = ?
         FOR UPDATE`,
        [transactionId]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          message: "Transaksi tidak ditemukan.",
        });
      }

      const transaction = rows[0];

      if (Number(transaction.organizer_id) !== Number(organizerId)) {
        await connection.rollback();
        return res.status(403).json({
          message: "Kamu tidak berhak memproses transaksi ini.",
        });
      }

      if (transaction.status !== "waiting_confirmation") {
        await connection.rollback();
        return res.status(400).json({
          message: "Transaksi tidak sedang menunggu konfirmasi.",
        });
      }

      // 1. Ubah status transaksi menjadi rejected
      await connection.query(
        `UPDATE transactions
         SET status = 'rejected'
         WHERE id = ?`,
        [transactionId]
      );

      // 2. Kembalikan kursi event
      await connection.query(
        `UPDATE events
         SET available_seats = available_seats + ?
         WHERE id = ?`,
        [transaction.ticket_quantity, transaction.event_id]
      );

      // 3. Kembalikan pemakaian kupon
      if (transaction.coupon_id !== null) {
        await connection.query(
          `UPDATE coupons
           SET used_count = GREATEST(used_count - 1, 0)
           WHERE id = ?`,
          [transaction.coupon_id]
        );
      }

      // 4. Kembalikan poin Customer
      const [pointUsages] = await connection.query(
        `SELECT point_transaction_id, points_used
         FROM transaction_point_usage
         WHERE transaction_id = ?`,
        [transactionId]
      );

      let pointsReturned = 0;

      for (const usage of pointUsages) {
        await connection.query(
          `UPDATE point_transactions
           SET remaining_points = remaining_points + ?
           WHERE id = ? AND user_id = ?`,
          [
            usage.points_used,
            usage.point_transaction_id,
            transaction.customer_id,
          ]
        );

        pointsReturned += Number(usage.points_used);
      }

      if (pointsReturned > 0) {
        await connection.query(
          `UPDATE users
           SET points = points + ?
           WHERE id = ?`,
          [pointsReturned, transaction.customer_id]
        );
      }

      await connection.commit();

      return res.status(200).json({
        message: "Transaksi ditolak. Kursi, kupon, dan poin berhasil dikembalikan.",
        transaction_id: transactionId,
        status: "rejected",
        seats_returned: transaction.ticket_quantity,
        coupon_returned: transaction.coupon_id !== null,
        points_returned: pointsReturned,
      });
    } catch (error) {
      if (connection) {
        await connection.rollback().catch(() => {});
      }

      console.error("Reject payment error:", error);

      return res.status(500).json({
        message: "Terjadi kesalahan saat menolak pembayaran.",
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);


/* AUTOMATICALLY EXPIRE UNPAID TRANSACTIONS */
const expireUnpaidTransactions = async () => {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Kunci transaksi yang sudah melewati batas waktu.
   const [expiredTransactions] = await connection.query(
  `SELECT
     id,
     event_id,
     customer_id,
     ticket_quantity,
     coupon_id
   FROM transactions
   WHERE status = 'waiting_payment'
     AND payment_deadline <= NOW()
   FOR UPDATE`
);

    for (const transaction of expiredTransactions) {
      // Ubah status hanya jika masih menunggu pembayaran.
      const [result] = await connection.query(
        `UPDATE transactions
         SET status = 'expired'
         WHERE id = ?
           AND status = 'waiting_payment'`,
        [transaction.id]
      );

      // Kembalikan kursi hanya jika status berhasil diubah.
      if (result.affectedRows === 1) {
        await connection.query(
          `UPDATE events
           SET available_seats = available_seats + ?
           WHERE id = ?`,
          [transaction.ticket_quantity, transaction.event_id]
        );
        // Kembalikan kuota kupon jika transaksi expired
        if (transaction.coupon_id !== null) {
          await connection.query(
            `UPDATE coupons
             SET used_count = GREATEST(used_count - 1, 0)
             WHERE id = ?`,
            [transaction.coupon_id]
          );
        }

// Kembalikan poin Customer jika sebelumnya menggunakan poin
const [pointUsages] = await connection.query(
  `SELECT point_transaction_id, points_used
   FROM transaction_point_usage
   WHERE transaction_id = ?`,
  [transaction.id]
);

let pointsReturned = 0;

for (const usage of pointUsages) {
  await connection.query(
    `UPDATE point_transactions
     SET remaining_points = remaining_points + ?
     WHERE id = ? AND user_id = ?`,
    [
      usage.points_used,
      usage.point_transaction_id,
      transaction.customer_id,
    ]
  );

  pointsReturned += Number(usage.points_used);
}

if (pointsReturned > 0) {
  await connection.query(
    `UPDATE users
     SET points = points + ?
     WHERE id = ?`,
    [pointsReturned, transaction.customer_id]
  );
}
        console.log(
          `Transaksi ${transaction.id} expired. ` +
          `${transaction.ticket_quantity} kursi dikembalikan.`
        );
      }
    }

    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Expire transactions error:", error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Periksa setiap 10 detik.
setInterval(expireUnpaidTransactions, 10 * 1000);

// Jalankan pemeriksaan saat backend mulai.
expireUnpaidTransactions();

/* AUTOMATICALLY CANCEL UNCONFIRMED TRANSACTIONS */
const cancelUnconfirmedTransactions = async () => {
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Cari transaksi yang melewati batas konfirmasi.
    const [transactions] = await connection.query(
  `SELECT
  id,
  event_id,
  customer_id,
  ticket_quantity,
  coupon_id
FROM transactions
WHERE status = 'waiting_confirmation'
  AND confirmation_deadline IS NOT NULL
  AND confirmation_deadline <= NOW()
FOR UPDATE`
);

    for (const transaction of transactions) {
      // Batalkan transaksi yang masih menunggu konfirmasi.
      const [result] = await connection.query(
        `UPDATE transactions
         SET status = 'cancelled'
         WHERE id = ?
           AND status = 'waiting_confirmation'
           AND confirmation_deadline <= NOW()`,
        [transaction.id]
      );

      // Kembalikan kursi hanya jika transaksi berhasil dibatalkan.
      if (result.affectedRows === 1) {
        // 1. Kembalikan kursi event
await connection.query(
  `UPDATE events
   SET available_seats = available_seats + ?
   WHERE id = ?`,
  [transaction.ticket_quantity, transaction.event_id]
);

// 2. Kembalikan pemakaian kupon
if (transaction.coupon_id !== null) {
  await connection.query(
    `UPDATE coupons
     SET used_count = GREATEST(used_count - 1, 0)
     WHERE id = ?`,
    [transaction.coupon_id]
  );
}

// 3. Kembalikan poin Customer
const [pointUsages] = await connection.query(
  `SELECT point_transaction_id, points_used
   FROM transaction_point_usage
   WHERE transaction_id = ?`,
  [transaction.id]
);

let pointsReturned = 0;

for (const usage of pointUsages) {
  await connection.query(
    `UPDATE point_transactions
     SET remaining_points = remaining_points + ?
     WHERE id = ? AND user_id = ?`,
    [
      usage.points_used,
      usage.point_transaction_id,
      transaction.customer_id,
    ]
  );

  pointsReturned += Number(usage.points_used);
}

if (pointsReturned > 0) {
  await connection.query(
    `UPDATE users
     SET points = points + ?
     WHERE id = ?`,
    [pointsReturned, transaction.customer_id]
  );
}

console.log(
  `Transaksi ${transaction.id} dibatalkan otomatis. ` +
  `${transaction.ticket_quantity} kursi, kupon, dan poin dikembalikan.`
);
      }
    }

    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Cancel unconfirmed transactions error:", error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Periksa setiap 10 detik.
setInterval(cancelUnconfirmedTransactions, 10 * 1000);

// Jalankan pemeriksaan saat backend mulai.
cancelUnconfirmedTransactions();

/* GET TRANSACTION HISTORY - CUSTOMER */
app.get(
  "/api/customer/transactions",
  verifyToken,
  authorizeRole("customer"),
  async (req, res) => {
    try {
      const customerId = req.user.id;

      const [transactions] = await db.query(
        `SELECT
          t.id AS transaction_id,
          t.booking_code,
          t.event_id,
          e.title AS event_title,
          e.location AS event_location,
          e.event_date,
          t.ticket_quantity,
          t.ticket_price,
          t.total_amount,
          t.payment_proof,
          t.status,
          t.payment_deadline,
          t.confirmation_deadline,
          t.created_at
        FROM transactions t
        JOIN events e ON t.event_id = e.id
        WHERE t.customer_id = ?
        ORDER BY t.created_at DESC`,
        [customerId]
      );

      return res.status(200).json({
        message: "Riwayat transaksi berhasil diambil.",
        total: transactions.length,
        transactions,
      });
    } catch (error) {
      console.error("Get customer transactions error:", error);

      return res.status(500).json({
        message: "Terjadi kesalahan saat mengambil riwayat transaksi.",
      });
    }
  }
);
// ========================================
// 11. ATTENDEE LIST - ORGANIZER
// ========================================
app.get(
  "/api/organizer/attendees",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;
      const eventId = req.query.event_id
        ? Number(req.query.event_id)
        : null;

      if (
        eventId !== null &&
        (!Number.isInteger(eventId) || eventId <= 0)
      ) {
        return res.status(400).json({
          status: "error",
          message: "ID event tidak valid.",
        });
      }

      let query = `
        SELECT
          t.id AS transaction_id,
          t.booking_code,
          t.event_id,
          e.title AS event_title,
          u.name AS attendee_name,
          t.ticket_quantity,
          t.total_amount,
          t.created_at
        FROM transactions t
        JOIN events e ON t.event_id = e.id
        JOIN users u ON t.customer_id = u.id
        WHERE e.organizer_id = ?
          AND t.status = 'done'
      `;

      const params = [organizerId];

      if (eventId !== null) {
        query += " AND t.event_id = ?";
        params.push(eventId);
      }

      query += " ORDER BY e.title ASC, t.created_at DESC";

      const [attendees] = await db.query(query, params);

      return res.status(200).json({
        status: "success",
        total: attendees.length,
        data: attendees,
      });
    } catch (error) {
      console.error("Get attendee list error:", error);

      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil daftar peserta.",
      });
    }
  }
);

/* ========================================
   ORGANIZER SALES REPORT
======================================== */
app.get(
  "/api/organizer/sales-report",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;
      const period = req.query.period || "monthly";

      // Periode laporan yang diizinkan
      const periodSettings = {
  daily: {
    interval: "7 DAY",
    groupBy: "DATE(t.created_at)",
    label: "DATE_FORMAT(DATE(t.created_at), '%d/%m/%Y')",
  },
  monthly: {
    interval: "12 MONTH",
    groupBy: "DATE_FORMAT(t.created_at, '%Y-%m')",
    label: "DATE_FORMAT(DATE_FORMAT(t.created_at, '%Y-%m'), '%m/%Y')",
  },
  yearly: {
    interval: "5 YEAR",
    groupBy: "YEAR(t.created_at)",
    label: "CAST(YEAR(t.created_at) AS CHAR)",
  },
};

      if (!periodSettings[period]) {
        return res.status(400).json({
          status: "error",
          message: "Periode laporan tidak valid.",
        });
      }

      const setting = periodSettings[period];

      // Ambil data penjualan berdasarkan periode
      const [rows] = await db.query(
        `
        SELECT
          ${setting.groupBy} AS period_key,
          ${setting.label} AS label,
          COALESCE(SUM(t.total_amount), 0) AS revenue,
          COALESCE(SUM(t.ticket_quantity), 0) AS tickets,
          COUNT(t.id) AS transactions
        FROM transactions t
        JOIN events e ON t.event_id = e.id
        WHERE e.organizer_id = ?
          AND t.status = 'done'
          AND t.created_at >= DATE_SUB(
            NOW(),
            INTERVAL ${setting.interval}
          )
        GROUP BY ${setting.groupBy}, ${setting.label}
ORDER BY ${setting.groupBy} ASC
        `,
        [organizerId]
      );

      // Hitung ringkasan berdasarkan data grafik
      const summary = rows.reduce(
        (result, item) => {
          result.total_revenue += Number(item.revenue);
          result.tickets_sold += Number(item.tickets);
          result.total_transactions += Number(item.transactions);

          return result;
        },
        {
          total_revenue: 0,
          tickets_sold: 0,
          total_transactions: 0,
        }
      );

      return res.status(200).json({
        status: "success",
        message: "Laporan penjualan berhasil diambil.",
        data: {
          period,
          summary,
          chart: rows.map((item) => ({
            label: item.label,
            revenue: Number(item.revenue),
            tickets: Number(item.tickets),
            transactions: Number(item.transactions),
          })),
        },
      });
    } catch (error) {
      console.error("Organizer sales report error:", error);

      return res.status(500).json({
        status: "error",
        message: "Gagal mengambil laporan penjualan.",
      });
    }
  }
);
// GET: Menampilkan kupon aktif untuk customer
app.get("/api/events/:id/coupons", async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({
        message: "ID event tidak valid.",
      });
    }

    const [coupons] = await db.query(
      `
      SELECT
        id,
        code,
        discount_type,
        discount_value,
        max_discount,
        min_purchase,
        ends_at
      FROM coupons
      WHERE event_id = ?
        AND user_id IS NULL
        AND is_active = 1
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (ends_at IS NULL OR ends_at >= NOW())
        AND (usage_limit IS NULL OR used_count < usage_limit)
      ORDER BY discount_value DESC
      `,
      [eventId]
    );

    return res.status(200).json({
      status: "success",
      data: coupons,
    });
  } catch (error) {
    console.error("Get public event coupons error:", error);

    return res.status(500).json({
      message: "Gagal mengambil data kupon.",
    });
  }
});
/* ========================================
   ORGANIZER VOUCHERS
======================================== */

// 1. GET: Melihat semua voucher milik organizer
app.get(
  "/api/organizer/coupons",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;

      const [coupons] = await db.query(
        `SELECT
          c.id,
          c.event_id,
          e.title AS event_title,
          c.code,
          c.discount_type,
          c.discount_value,
          c.max_discount,
          c.min_purchase,
          c.usage_limit,
          c.used_count,
          c.starts_at,
          c.ends_at,
          c.is_active,
          c.created_at
        FROM coupons c
        JOIN events e ON c.event_id = e.id
        WHERE e.organizer_id = ?
        ORDER BY c.created_at DESC`,
        [organizerId]
      );

      return res.status(200).json({
        status: "success",
        data: coupons,
      });
    } catch (error) {
      console.error("Get organizer coupons error:", error);

      return res.status(500).json({
        message: "Gagal mengambil data voucher.",
      });
    }
  }
);


// 2. POST: Membuat voucher baru
app.post(
  "/api/organizer/coupons",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;

      const {
        event_id,
        code,
        discount_type,
        discount_value,
        max_discount,
        min_purchase = 0,
        usage_limit,
        starts_at,
        ends_at,
      } = req.body;

      const eventId = Number(event_id);
      const discountValue = Number(discount_value);
      const minPurchase = Number(min_purchase);

      const normalizedCode =
        typeof code === "string" ? code.trim().toUpperCase() : "";

      if (
        !Number.isInteger(eventId) ||
        eventId <= 0 ||
        !normalizedCode ||
        normalizedCode.length > 50 ||
        !["percentage", "fixed"].includes(discount_type) ||
        !Number.isFinite(discountValue) ||
        discountValue <= 0 ||
        !Number.isFinite(minPurchase) ||
        minPurchase < 0
      ) {
        return res.status(400).json({
          message: "Data voucher tidak valid.",
        });
      }

      if (
        discount_type === "percentage" &&
        discountValue > 100
      ) {
        return res.status(400).json({
          message: "Diskon persentase maksimal 100%.",
        });
      }

      const maxDiscount =
        max_discount === "" ||
        max_discount === null ||
        max_discount === undefined
          ? null
          : Number(max_discount);

      if (
        maxDiscount !== null &&
        (!Number.isFinite(maxDiscount) || maxDiscount < 0)
      ) {
        return res.status(400).json({
          message: "Maksimal diskon tidak valid.",
        });
      }

      const usageLimit =
        usage_limit === "" ||
        usage_limit === null ||
        usage_limit === undefined
          ? null
          : Number(usage_limit);

      if (
        usageLimit !== null &&
        (!Number.isInteger(usageLimit) || usageLimit <= 0)
      ) {
        return res.status(400).json({
          message: "Batas penggunaan harus bilangan bulat positif.",
        });
      }

      if (
        !starts_at ||
        !ends_at ||
        !Number.isFinite(new Date(starts_at).getTime()) ||
        !Number.isFinite(new Date(ends_at).getTime()) ||
        new Date(ends_at) <= new Date(starts_at)
      ) {
        return res.status(400).json({
          message: "Tanggal mulai dan berakhir voucher tidak valid.",
        });
      }

      // Pastikan event benar-benar milik organizer yang login
      const [events] = await db.query(
        `SELECT id
         FROM events
         WHERE id = ? AND organizer_id = ?`,
        [eventId, organizerId]
      );

      if (events.length === 0) {
        return res.status(404).json({
          message: "Event tidak ditemukan atau bukan milik Anda.",
        });
      }

      // Pastikan kode voucher belum digunakan
      const [existing] = await db.query(
        "SELECT id FROM coupons WHERE code = ?",
        [normalizedCode]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          message: "Kode voucher sudah digunakan. Silakan gunakan kode lain.",
        });
      }

      await db.query(
        `INSERT INTO coupons (
          user_id,
          event_id,
          code,
          discount_type,
          discount_value,
          max_discount,
          min_purchase,
          usage_limit,
          starts_at,
          ends_at,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          null,
          eventId,
          normalizedCode,
          discount_type,
          discountValue,
          maxDiscount,
          minPurchase,
          usageLimit,
          starts_at,
          ends_at,
        ]
      );

      return res.status(201).json({
        status: "success",
        message: "Voucher berhasil dibuat.",
      });
    } catch (error) {
      console.error("Create organizer coupon error:", error);

      return res.status(500).json({
        message: "Gagal membuat voucher.",
      });
    }
  }
);


// 3. PUT: Mengubah voucher
app.put(
  "/api/organizer/coupons/:id",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;
      const couponId = Number(req.params.id);

      const {
        event_id,
        code,
        discount_type,
        discount_value,
        max_discount,
        min_purchase = 0,
        usage_limit,
        starts_at,
        ends_at,
      } = req.body;

      const eventId = Number(event_id);
      const discountValue = Number(discount_value);
      const minPurchase = Number(min_purchase);

      const normalizedCode =
        typeof code === "string" ? code.trim().toUpperCase() : "";

      if (
        !Number.isInteger(couponId) ||
        couponId <= 0 ||
        !Number.isInteger(eventId) ||
        eventId <= 0 ||
        !normalizedCode ||
        normalizedCode.length > 50 ||
        !["percentage", "fixed"].includes(discount_type) ||
        !Number.isFinite(discountValue) ||
        discountValue <= 0 ||
        !Number.isFinite(minPurchase) ||
        minPurchase < 0
      ) {
        return res.status(400).json({
          message: "Data voucher tidak valid.",
        });
      }

      if (
        discount_type === "percentage" &&
        discountValue > 100
      ) {
        return res.status(400).json({
          message: "Diskon persentase maksimal 100%.",
        });
      }

      const maxDiscount =
        max_discount === "" ||
        max_discount === null ||
        max_discount === undefined
          ? null
          : Number(max_discount);

      if (
        maxDiscount !== null &&
        (!Number.isFinite(maxDiscount) || maxDiscount < 0)
      ) {
        return res.status(400).json({
          message: "Maksimal diskon tidak valid.",
        });
      }

      const usageLimit =
        usage_limit === "" ||
        usage_limit === null ||
        usage_limit === undefined
          ? null
          : Number(usage_limit);

      if (
        usageLimit !== null &&
        (!Number.isInteger(usageLimit) || usageLimit <= 0)
      ) {
        return res.status(400).json({
          message: "Batas penggunaan harus bilangan bulat positif.",
        });
      }

      if (
        !starts_at ||
        !ends_at ||
        !Number.isFinite(new Date(starts_at).getTime()) ||
        !Number.isFinite(new Date(ends_at).getTime()) ||
        new Date(ends_at) <= new Date(starts_at)
      ) {
        return res.status(400).json({
          message: "Tanggal mulai dan berakhir voucher tidak valid.",
        });
      }

      // Pastikan voucher tersebut milik organizer yang login
      const [ownedCoupons] = await db.query(
        `SELECT c.id
         FROM coupons c
         JOIN events e ON c.event_id = e.id
         WHERE c.id = ?
           AND e.organizer_id = ?`,
        [couponId, organizerId]
      );

      if (ownedCoupons.length === 0) {
        return res.status(404).json({
          message: "Voucher tidak ditemukan atau bukan milik Anda.",
        });
      }

      // Pastikan event tujuan juga milik organizer
      const [events] = await db.query(
        `SELECT id
         FROM events
         WHERE id = ? AND organizer_id = ?`,
        [eventId, organizerId]
      );

      if (events.length === 0) {
        return res.status(404).json({
          message: "Event tidak ditemukan atau bukan milik Anda.",
        });
      }

      // Cek kode agar tidak bentrok dengan voucher lain
      const [existing] = await db.query(
        `SELECT id
         FROM coupons
         WHERE code = ? AND id <> ?`,
        [normalizedCode, couponId]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          message: "Kode voucher sudah digunakan.",
        });
      }

      await db.query(
        `UPDATE coupons
         SET
           event_id = ?,
           code = ?,
           discount_type = ?,
           discount_value = ?,
           max_discount = ?,
           min_purchase = ?,
           usage_limit = ?,
           starts_at = ?,
           ends_at = ?
         WHERE id = ?`,
        [
          eventId,
          normalizedCode,
          discount_type,
          discountValue,
          maxDiscount,
          minPurchase,
          usageLimit,
          starts_at,
          ends_at,
          couponId,
        ]
      );

      return res.status(200).json({
        status: "success",
        message: "Voucher berhasil diperbarui.",
      });
    } catch (error) {
      console.error("Update organizer coupon error:", error);

      return res.status(500).json({
        message: "Gagal memperbarui voucher.",
      });
    }
  }
);


// 4. PATCH: Mengaktifkan atau menonaktifkan voucher
app.patch(
  "/api/organizer/coupons/:id/status",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;
      const couponId = Number(req.params.id);
      const isActive = req.body.is_active;

      if (
        !Number.isInteger(couponId) ||
        couponId <= 0 ||
        ![0, 1, true, false].includes(isActive)
      ) {
        return res.status(400).json({
          message: "Data status voucher tidak valid.",
        });
      }

      const [result] = await db.query(
        `UPDATE coupons c
         JOIN events e ON c.event_id = e.id
         SET c.is_active = ?
         WHERE c.id = ?
           AND e.organizer_id = ?`,
        [Number(isActive), couponId, organizerId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Voucher tidak ditemukan atau status tidak berubah.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Status voucher berhasil diperbarui.",
      });
    } catch (error) {
      console.error("Update coupon status error:", error);

      return res.status(500).json({
        message: "Gagal mengubah status voucher.",
      });
    }
  }
);


// 5. DELETE: Menonaktifkan voucher (soft delete)
app.delete(
  "/api/organizer/coupons/:id",
  verifyToken,
  authorizeRole("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;
      const couponId = Number(req.params.id);

      if (!Number.isInteger(couponId) || couponId <= 0) {
        return res.status(400).json({
          message: "ID voucher tidak valid.",
        });
      }

      const [result] = await db.query(
        `UPDATE coupons c
         JOIN events e ON c.event_id = e.id
         SET c.is_active = 0
         WHERE c.id = ?
           AND e.organizer_id = ?`,
        [couponId, organizerId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Voucher tidak ditemukan.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Voucher berhasil dinonaktifkan.",
      });
    } catch (error) {
      console.error("Delete organizer coupon error:", error);

      return res.status(500).json({
        message: "Gagal menonaktifkan voucher.",
      });
    }
  }
);

// GET: Menampilkan tiket milik customer yang sedang login
app.get("/api/my-tickets", verifyToken, async (req, res) => {
  try {
    const customerId = req.user.id;

    const [tickets] = await db.query(
      `SELECT
        t.id,
        t.transaction_id,
        t.event_id,
        t.ticket_code,
        t.qr_token,
        t.status,
        t.checked_in_at,
        t.created_at,
        e.title AS event_title
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      WHERE t.customer_id = ?
      ORDER BY t.created_at DESC`,
      [customerId]
    );

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Gagal mengambil tiket:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data tiket.",
    });
  }
});
// ========================================
// 12. JALANKAN SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`EVENTLY API running at http://localhost:${PORT}`);
});
