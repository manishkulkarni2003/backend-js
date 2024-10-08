const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}





export { asyncHandler }











//wrapper function
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)

//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }




// const asyncHandler=()=>{

// }
// const asyncHandler=(func)=>async()=>{}
//we are passing a function to the other function as param