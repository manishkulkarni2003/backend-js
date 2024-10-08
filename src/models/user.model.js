import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken' // 👍
jwt.JsonWebTokenError // 👍
import bcrypt from "bcrypt"



const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,

        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,//cloudinary url 
            required: true,


        },
        coverImage: {
            type: String,

        },
        watchHistory: [{
            type: Schema.Types.ObjectId,
            ref: "Video"

        }],
        password: {
            type: String,
            required: [true, 'Password is Required'],


        },
        refreshToken: {
            type: String

        }




    }, { timestamps: true })


//prehook before doind something in datbase do this so before saving encrypt the pass
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)//encyrpting the password

    next()

})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)

}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,

        },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,


        },
        process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
    )
}

export const User = mongoose.model("User", userSchema)

//mongodb mein users ke nam se save hoga

//jwt is bearer token 








