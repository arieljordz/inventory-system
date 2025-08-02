
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "qr_codes", // optional folder in your Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
  },
});

const upload = multer({ storage });

export default upload;
