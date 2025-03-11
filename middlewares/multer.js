//admin/middleware/multer.js

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "uploads", // Specify the Cloudinary folder
        allowed_formats: ["jpg", "jpeg", "png"], // Restrict file types
    },
});

const upload = multer({ storage });

export default upload;




// import multer from "multer";
// import path from "path";

// // Configure storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// // File filter to restrict types (optional)
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only image files are allowed!"), false);
//     }
// };

// // Create multer instance
// const upload = multer({ storage, fileFilter });

// export default upload;
