import { Router } from "express";

import { getAllVideos, getVideoById, publishVideo, updateVideo, deleteVideo } from "../controllers/video.controller.js"

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js"

const router = Router();

router.route("/publishVideo").post(
    upload.fields(
        [
            {
                name: "videoFile",
                maxCount: 1

            }

        ]
    ),
    publishVideo)

// router.route("/publishVideo").post(
//     upload.fields([
//         {
//             name: "videoFile",  // Use 'name' to define the field key
//             maxCount: 1
//         }
//     ]),
//     publishVideo
// );


router.route("/getVideo").get(verifyJWT, getVideoById)

router.route("/updateVideo").patch(verifyJWT, updateVideo)

router.route("/deleteVideo").delete(verifyJWT, deleteVideo)

export default router 