export {};
const multer = require("multer");
const cloudinary = require("cloudinary").v2; 
const { CloudinaryStorage } = require("multer-storage-cloudinary");


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Libreria_Oscura", // Carpeta en Cloudinary
        allowedFormats: ["jpg", "png", "jpeg", "webp"],
    },
});
// 7.2 Creamos la función 'upload' que usaremos en las rutas
const upload = multer({ storage });
// 7.2 Exportamos la función 'upload' para usarla en las rutas
module.exports = upload;