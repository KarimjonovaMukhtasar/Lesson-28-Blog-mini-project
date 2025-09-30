import { Router } from "express"


const MiddleWare = Router()

MiddleWare.use((req, res, next) => {
    const url = req.url

    console.log({
        method: req.method,
        url: req.url
    })
    next()
    // if (url.startsWith("http://localhost:3000/users" || url.startsWith("http://localhost:3000/posts" || url.startsWith("http://localhost:3000/comments")))) {
    //    next()
    // }
    // else{
    //      res.status(404).json({ message: "Not Found such a url" })
    // }
})
export default MiddleWare