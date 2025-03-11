import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();


// console.log({ name: process.env.CLOUDINARY_CLOUD_NAME, key: process.env.CLOUDINARY_API_SECRET, api: process.env.CLOUDINARY_API_KEY })
// console.log(process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// console.log("Cloudinary Config:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
export default cloudinary;