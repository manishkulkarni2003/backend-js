import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { ApiResponse } from "../utils/ApiResponse.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { Video } from "../models/video.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

})


const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        throw new ApiError(400, "All Fields are required")
    }
    if (!description) {
        throw new ApiError(400, "All Fields are required")
    }

    // const isUploaded = await Video.findOne(
    //     {
    //         $or: [title, description]

    //     }
    // )
    const videoLocalPath = req.file?.videoFile[0].path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video File is required")

    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    if (!videoFile) {
        throw new ApiError(400, "Failed to upload video")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url

    })

    const uploadedVideo = await Video.findById(video._id);

    if (!uploadedVideo) {
        throw new ApiError(500, "Something Really went Wrong")

    }


    return res
        .status(200)
        .json(new ApiResponse(200, uploadedVideo, "Video Uploaded Successfully"))


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {
        const video = await Video.findById(videoId);

        if (!video) {
            return res
                .status(404)
                .json(new ApiResponse(404, video, "Couldnt fetch Video"))
        }

        return res
            .status(200)
            .json(new ApiResponse(200, video, "Video Fetched Successfully"))

    } catch (error) {
        return res
            .status(500)
            .json({ message: "error While fetching the video", error: error.message })


    }
}
)

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const updateData = req.body;

    const updateVideo = await findByIdAndUpdate(
        videoId,
        updateData,
        { new: true }
    )
    if (!updateVideo) {
        throw new ApiError(400, updateVideo, "Couldnt Update the Video")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updateVideo, "Successfully Updated the Video"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const deleteVideo = await findByIdAndDelete(
        videoId
    )

    if (!deleteVideo) {
        throw new ApiError(400, deleteVideo, "Couldnt Delete the Video")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, deleteVideo, "Video Deleted Successfully"))



})




export { getAllVideos, getVideoById, publishVideo, updateVideo, deleteVideo }
