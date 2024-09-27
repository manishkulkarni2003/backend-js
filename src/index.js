

// require('dotenv').config({ path: './env' })
import dotenv from "dotenv"

import connectDB from "./db/index.js";


dotenv.config({
    path: "./env",
})


connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR", error)
            throw error

        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("Mongo db connection failed", err)

    })

























// import express from "express";

// const app = express()

//     //iffe immediatly invoking function
//     ; (async () => {
//         try {
//             await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//             app.on("error", (error) => {
//                 console.log("ERR", error)
//                 throw error

//             })

//             app.listen(process.env.PORT, () => {
//                 console.log(`The app is listening on port ${process.env.PORT}`)
//             })
//         }
//         catch (error) {
//             console.error("Error:", error)
//             throw err
//         }
//     })()