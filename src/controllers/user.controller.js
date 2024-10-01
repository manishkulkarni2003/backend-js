
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
jwt.JsonWebTokenError;



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "SomeThing Went Wrong while generating refresh and acces token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //Logic -->get user data from frontend -->postman (done)

    //validation --ex:email empty toh nahi de diya (done)

    //check if user already exists:username,email(done)


    //check if files/imgs are given ex:avatar*(done)

    //upload them to cloudinary,check avatar,check multer (done)


    //create user object -create entry in db(done)

    //remove password and refresh token filed from response (done)

    //check for user creation (done)

    //return res(done)


    //getting user data 
    const { fullname, email, username, password } = req.body
    console.log("email:", email);

    //validation
    //this also works 
    // if(fullname ===""){
    //     throw new ApiError(400,"Please Enter the Fullname")
    // } 
    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required ")
    }

    //check if user already exists
    const existedUser = await User.findOne({
        //or operator use kar rahe hai
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(409, "User Already exist")
    }
    console.log(req.files);

    //check if the image is uploaded by the user 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required ")
    }

    //upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed")
    }


    //creating object entry
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })
    //removing password and refresh token
    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"//this excludes password
    )
    if (!createduser) {
        throw new ApiError(500, "Something went wrong while registering the User ")
    }

    //return response 

    return res.status(201).json(
        new ApiResponse(200, createduser, "User registered Successfully")
    )




})

const loginUser = asyncHandler(async (req, res) => {
    //resbody se data lao
    //username or email
    //find the user 
    //password check -->iferr
    //access and refresh token 
    //send cookie 
    const { email, username, password } = req.body
    //check if user exists
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required ");

    }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    })

    if (!user) {
        throw new ApiError(404, "User not found Please Register Yourself")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials")

    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //cookies to be continued 
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            }, "User Logged in Successfully")

        )
})


const logoutUser = asyncHandler(async (req, res) => {
    //delete refresh token from db
    //delete cookie
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        { new: true }
    )
    //access token aur refresh token ham isliye use karte taki user ko bar bar email aur password na enter karna pade 
    //access token short time period ke liye hai 
    //refresh token longer time period ke liye hai



    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out Successfully"))


})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "UnAuthorized Request")
    }

    try {
        const decodedToken = jwt.verify(
            //decoding the refresh token 
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refreshToken")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, newRefreshToken }, "Access Token Refreshed Successfully")
            )

    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh token  ")

    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, } = req.body

    //code for confirm password
    // if (!(newPassword === confPassword)) {
    //     throw new ApiError(400, "Your Password doesnt Match")
    // }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Password")

    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "PassWord Changed Successfully"))

})

const getcurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current User Fetched Successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email, phone } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "All fields are Required");

    }
    const user = await User
        .findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullname: fullname,
                    email: email

                }
            },
            { new: true }


        ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    // const user = await User.findById(req.user?._id)
    // if (!user) {
    //     throw new ApiError(400, "Invalid User")
    // }
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "error while uploading on avatar ")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,

            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Updated Successfully"))

})

const updateUsercoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage is Required ")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "error while uploading on avatar ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Coverimage Updated Successfully"))

})

//getting user 
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")

    }
    /*aggregate join kar rahe hai pahile match fir dusre document mein dekh rahe hai lookup */
    //calculating subscriber of channel
    const channel = await User.
        aggregate([
            {
                $match: {
                    username: username?.toLowerCase()

                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"

                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"

                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"

                    },
                    channelSubscribedToCount: {
                        $size: "subscribedTo"
                    },
                    isSubscribed: {
                        $condition: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            { //selectd cheezi dikhata
                $project: {
                    fullname: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist")

    }
    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "User Channel Fetched Successfully"))


})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                //mongoose kam nahi karta directly object id chahiye
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $projects: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                                {
                                    $addFields: {
                                        owner: {
                                            $first: "$owner"
                                        }
                                    }
                                }
                            ]

                        }
                    }
                ]

            }
        }
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))

})




export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getcurrentUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage, getUserChannelProfile, getWatchHistory }
