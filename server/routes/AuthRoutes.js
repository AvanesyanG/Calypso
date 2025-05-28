import express from "express";
import { getUserInfo, signup, login, updateProfile, addProfileImage, removeProfileImage, logout } from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import multer from "multer";
import { Buffer } from "buffer";

const authRoutes = express.Router();

// 🛠 Правильная настройка multer:
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles");
  },
  filename: (req, file, cb) => {
    // Декодируем имя файла правильно из latin1 → utf8
    const decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // Если нужно — очистить имя файла от опасных символов:
    const safeFileName = decodedOriginalName.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");

    cb(null, safeFileName);
  }
});

const upload = multer({ storage: storage });

authRoutes.post("/api/auth/signup", signup);
authRoutes.post("/api/auth/login", login);
authRoutes.get("/api/auth/user-info", verifyToken, getUserInfo);
authRoutes.post("/api/auth/update-profile", verifyToken, updateProfile);

// 🛠 Здесь используем исправленный upload:
authRoutes.post("/api/auth/add-profile-image", verifyToken, upload.single('profile-image'), addProfileImage);

authRoutes.delete("/api/auth/remove-profile-image", verifyToken, removeProfileImage);
authRoutes.post("/api/auth/logout", logout);

export default authRoutes;
