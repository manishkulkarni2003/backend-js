
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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
    const existedUser = User.findOne({
        //or operator use kar rahe hai
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(409, "User Already exist")
    }

    //check if the image is uploaded by the user 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
        "-password -refreshToken"
    )
    if (!createduser) {
        throw new ApiError(500, "Something went wrong while registering the User ")
    }

    //return response 

    return res.status(201).json(
        new ApiResponse(200, createduser, "User registered Successfully")
    )




})

export { registerUser }
