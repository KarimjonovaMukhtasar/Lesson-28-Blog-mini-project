import express from "express"
import morgan from "morgan"
import 'dotenv/config'

import { postsRoutes, userRoutes, commentsRoutes } from "./routes/index.js"

const app = express()
// const PORT = process.env.PORT || 3000
const PORT = process.argv[2].split("=")[1] || 3000

app.use(express.json())
app.use(morgan('tiny'))

//routes
app.use("/users", userRoutes)
app.use("/posts", postsRoutes)
app.use("/comments", commentsRoutes)


app.use((req, res) => {
  const method = req.method
  const url = req.url
  res.status(404).send(`Cannot ${method} ${url}`)
})



app.listen(PORT, () => {
  console.log(`Server runnnin on port ${PORT}`)
})