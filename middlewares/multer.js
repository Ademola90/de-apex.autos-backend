//admin/middleware/multer.js

import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.resolve("uploads");
        cb(null, uploadPath); // Save to the 'uploads' directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
        cb(null, uniqueSuffix + "-" + file.originalname); // Unique file name
    },
});

// File filter to restrict types (optional)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// Create multer instance
const upload = multer({ storage, fileFilter });

export default upload;
