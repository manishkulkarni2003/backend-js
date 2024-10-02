import mongoose, { Schema } from "mongoose";

const likeSchema = new mongoose.Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "comment"

    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"

    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "tweet"

    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"

    }



}, { timestamps: true })

export const like = mongoose.model("like", likeSchema)
