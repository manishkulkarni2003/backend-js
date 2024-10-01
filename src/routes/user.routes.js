import { Router } from "express";
import {
    loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword, getcurrentUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage, getUserChannelProfile, getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/Auth.middleware.js"
const router = Router();

router.route("/register").post(
    //middle ware multer is used 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

// router.route("/login").post(loginUser)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getcurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/coverImage").patch(verifyJWT, upload.single("/coverImage"), updateUsercoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)

export default router 
