import multer from "multer"
import { AppError } from "./globalError.js"


export const allowedValidation = {
    image: ["image/jpeg", "image/png"],
    video: ["video/mp4"],
    pdf: ["applicatioon/pdf"],
}


export const multerCloudinary = (customValidation) => {
    if (!customValidation) {
        customValidation = allowedValidation.image
    }
    const storage = multer.diskStorage({})

    const fileFilter = (req, file, cb) => {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new AppError("invalid file", 400), false)
        }
    }

    const upload = multer({ fileFilter, storage })
    return upload
}