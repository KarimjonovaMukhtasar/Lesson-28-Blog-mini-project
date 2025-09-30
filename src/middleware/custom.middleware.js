import { Router } from "express"


const MiddleWare = Router()

MiddleWare.use((req, res, next) => {
    const url = req.url

    console.log({
        method: req.method,
        url: req.url
    })
    next()
    if (!url.startsWith("/users" || !url.startsWith("/posts" || !url.startsWith("/comments")))) {
        res.status(404).json({ message: "Not Found such a url" })
    }

})
export default MiddleWare