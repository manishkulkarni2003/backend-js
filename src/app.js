import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

//app.use is used for middlewares and configurations 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true

}))

app.use(express.json({ limit: "16kb" }))
//url encode hone ke liye 
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

//file ko store karta hai
app.use(express.static("public"))

app.use(cookieParser())


//routes
import userRouter from "./routes/user.routes.js";



//routes declaration
app.use("/api/v1/users", userRouter)




// http://localhost:8000/api/v1/users/register

export { app }

