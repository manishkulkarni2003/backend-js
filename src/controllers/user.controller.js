
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


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
    if (!username || !email) {
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


export { registerUser, loginUser, logoutUser }
