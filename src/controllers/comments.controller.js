/*
example comment
{
  "id": "1",
  "post_id": "1",
  "author_id": "user2",
  "content": "This is a comment on the post.",
  "created_at": "2023-10-01T12:00:00Z",
  "updated_at": "2023-10-01T12:00:00Z"
}
*/
import { commentfile, db } from "../helpers/index.js"
import { v4 as uuidv4 } from 'uuid'
import { userfile } from "../helpers/index.js"
import {postfile} from "../helpers/index.js"

export const commentsController = {
  create: async function (req, res, next) {
    try {
      const comments = await db.read(commentfile)
      const newComment = req.body
      newComment.id = uuidv4()
      newComment.created_at = new Date().toISOString().slice(0, 16).replace("T", " ");
      if(newComment === null){
        return res.status(401).json({message: "It is required to fill the comments without leaving it empty!"})
      }
      const userId = newComment.author_id
      const postId = newComment.post_id
      const posts = await db.read(postfile)
      const users = await db.read(userfile)
      const postIndex = posts.findIndex(post=>post.id === postId)
      if(postIndex === -1){
        return res.status(401).json({message: `${postId} is not Found among posts! Check the spelling!`})
      }
      const userIndex = users.findIndex(user=>user.id === userId)
      if(userIndex === -1){
       return res.status(401).json({message: `${postId} is not Found among users! Check the spelling!`})
      }
      comments.push(newComment)
      await db.write(commentfile, comments)
      res.status(201).json({message: `New comment has been added to the post numbered ${postId}`})
    } catch (error) {
      next(error)
    }
  },
  update: async function (req, res, next) {
    try {
      const comments = await db.read(commentfile)
      const {id} = req.params
      const commentIndex = comments.findIndex(comment => comment.id === id)
      if (commentIndex === -1) {
        return res.status(404).send({ message: `#${id} Comment not found!` })
      }
       const updatedComment = { ...comments[commentIndex], ...req.body }
        updatedComment.updated_at = new Date().toISOString().slice(0, 16).replace("T", " ");
        comments.splice(comments[commentIndex], 1, updatedComment)
      await db.write(commentfile, comments)
      res.status(200).send(`Comment has been successfully updated!`)
    } catch (error) {
      next(error)
    }
  },
  delete: async function (req, res, next) {
    try {
      const { id } = req.params
      const comments = await db.read(commentfile)
      const commentIndex = comments.findIndex(comment => comment.id === id)
      if (commentIndex === -1) {
        return res.status(404).send({ message: `#${id} User not found!` })
      }
      comments.splice(commentIndex, 1)
      await db.write(commentfile, comments)
      res.status(200).send(`Comment has been successfully deleted!`)

    } catch (error) {
      next(error)
    }
  },
  find: async function (req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query
      let comments = await db.read(commentfile)
      if (search) {
        comments = comments.filter(comment =>
          comment.content.toLowerCase().includes(search.toLowerCase())
        )
      }
      const startIndex = (page - 1) * limit
      const endIndex = page * limit

      const paginatedComments = comments.slice(startIndex, endIndex)

      res.send({
        comments: paginatedComments,
        total: comments.length,
        page,
        limit
      })
    } catch (error) {
      next(error)
    }
  },
  findOne: async function (req, res, next) {
    try {
      const { id } = req.params
      const comments = await db.read(commentfile)
      const comment = comments.find(comment => comment.id === id)
      if (!comment) {
        return res.status(404).send({ message: `#${id} Comment not found!` })
      }
      res.send(comment)
    } catch (error) {
      next(error)
    }
  }
}