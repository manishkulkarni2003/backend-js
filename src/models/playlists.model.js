import mongoose, { Schema } from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    decription: {
        type: String,
        required: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"


        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }



}, { timestamps: true })

export const playlist = mongoose.model("playlist", playlistSchema)
