import { db } from "../helpers/index.js"
import { slugify } from "../helpers/index.js"
import { v4 as uuidv4 } from 'uuid'
import { postfile, userfile } from "../helpers/index.js"

// POSTS
/*
  0. ID - string (unique)
  1. CATEGORIES - array of strings required
  2. CREATED_AT - date required
  3. UPDATED_AT - date 
  4. AUTHOR_ID - string (user id) required
  5. VIEWS - number  || 0
  6. LIKES - number || 0
  7. LIKED_BY - array of user ids || []
  8. SUMMARY - string (max 200 chars), required
  9. CONTENT - string required
  10. TITLE - string required 
  11. SLUG - string (unique) 
  12. STATUS - string (draft, published, archived)

  title = Nega biznesga juniorlar kerak: nega aynan siz ekaningizni qanday isbotlash mumkin?
  slug = nega-biznesga-juniorlar-kerak-nega-aynan-siz-ekanligingizni-qanday-isbotlash-mumkin
  https://mohirdev.uz/blog/nega-biznesga-juniorlar-kerak/
*/

//example post object
/*
{
  "id": "1",
  "categories": ["business", "career"],
  "created_at": "2023-10-01T10:00:00Z",
  "updated_at": "2023-10-01T10:00:00Z",
  "author_id": "user1",
  "views": 150,
  "likes": 10,
  "liked_by": ["user2", "user3"],
  "summary": "This is a brief summary of the post, not exceeding 200 characters.",
  "content": "This is the full content of the post. It can be quite long and detailed.",
  "title": "Why Businesses Need Juniors: How to Prove You're the One?",
  "slug": "why-businesses-need-juniors-how-to-prove-youre-the-one",
  "status": "published"
}
*/
export const postsController = {
  create: async function (req, res, next) {
    try {
      const { body } = req
      //validation
      if (!body.title || !body.content || !body.summary || !body.author_id || !body.categories) {
        return res.status(400).send({ message: "Title, content, summary, author_id and categories are required!" })
      }
      if (body.summary.length > 200) {
        return res.status(400).send({ message: "Summary max length is 200 characters!" })
      }
      const slug = slugify(body.title)

      const posts = await db.read(postfile)
      const slugExists = posts.find(post => post.slug === slug)

      if (slugExists) {
        return res.status(409).send({ message: "Slug already exists!" })
      }

      const users = await db.read(userfile)
      const authorExists = users.find(user => user.id === body.author_id)

      if (!authorExists) {
        return res.status(400).send({ message: "Author not found!" })
      }
      const newPost = { ...body, id:  uuidv4(), slug, created_at: new Date(), views: 0, likes: 0, liked_by: [], status: "draft" }
      posts.push(newPost)
      await db.write(postfile, posts)

      res.status(201).send(newPost)

    } catch (error) {
      next(error)
    }
  },
  update: async function (req, res, next) {
    try {
    const {id} = req.params
      const posts = await db.read(postfile)
      const postIndex = posts.findIndex(post=>post.id === id)
      if(postIndex === -1){
        res.status(404).json({message: "Not Found such an id of post, check the spelling!"})
      } 
      const updatedPost = {...posts[postIndex], ...req.body}
      posts.splice(posts[postIndex])
      posts.push(updatedPost)
      await db.write(postfile, posts)
      res.status(200).json({message: "POST UPDATED SUCCESSFULLY!"})

    } catch (error) {
      next(error)
    }
  },
  delete: async function (req, res, next) {
    try {
      const {id} = req.params
      const posts = await db.read(postfile)
      const postIndex = posts.findIndex(post=>post.id === id)
      if(postIndex === -1){
        res.status(404).json({message: "Not Found such an id of post, check the spelling!"})
      } 
      posts.splice(postIndex, 1)
      await db.write(postfile, posts)
      res.status(200).json({message: "POST DELETED SUCCESSFULLY!"})
    } catch (error) {
      next(error)
    }
  },
  find: async function (req, res, next) {
    try {
      const { search, sortBy, page = 1, limit = 10 } = req.query
      const posts = await db.read(postfile)
      let filteredPosts = posts

      if (search) {
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.content.toLowerCase().includes(search.toLowerCase()) ||
          post.summary.toLowerCase().includes(search.toLowerCase()) ||
          post.categories.some(category => category.toLowerCase().includes(search.toLowerCase()))
        )
      }
      if (sortBy) {
        filteredPosts = filteredPosts.sort((a, b) => {
          if (sortOrder === "desc") {
            return b[sortBy] - a[sortBy]
          }
          return a[sortBy] - b[sortBy]
        })
      }
      const total = filteredPosts.length // 100
      const start = (page - 1) * limit // (1-1)*10 = 0 
      const end = start + limit // 0+10 = 10
      const paginatedPosts = filteredPosts.slice(start, end)
      res.send({
        posts: paginatedPosts,
        total,
        page,
        limit
      })
    } catch (error) {
      next(error)
    }
  },
  findOne: async function (req, res, next) {
    try {
      //TODO: increase views by 1
      const {id} = req.params
      const posts = await db.read(postfile)
      const postIndex = posts.findIndex(post=>post.id === id)
      if(postIndex === -1){
        res.status(404).json({message: "Not Found such an id of the post, check the spelling!"})
      } 
      posts[postIndex].views += 1
      await db.write(postfile, posts)
      res.status(200).json(posts[postIndex])
    } catch (error) {
      next(error)
    }
  },
  liked_by: async function (req, res, next) {
    try {
      // TODO: like or unlike post by user id
      // TODO: toggle like
      // 1. check if post exists
      const {id} = req.params
      const posts = await db.read(postfile)
      const postIndex = posts.findIndex(post=>post.id === id)
      if(postIndex === -1){
        res.status(404).json({message: "Not found such an id of a Post!"})
      }
      // 2. check if user exists
      const {userId} = req.params
      const users = await db.read(userfile)
      const userIndex = users.findIndex(user=>user.id === userId)
      if(userIndex === -1){
          res.status(404).json({message: "Not found such an id of a User!"})
      }
         // 3. check if user already liked the post
         // 5. if not liked, like it (add user id to liked_by array and increase likes by 1)
      if(!posts[postIndex].liked_by.includes(userId)){
        posts[postIndex].liked_by.push(userId)
        posts[postIndex].likes += 1
        await db.write(postfile, posts)
        res.status(200).json({message: `${userId} numbered User Liked the post under id of ${id}`})
      }
      // 4. if liked, unlike it (remove user id from liked_by array and decrease likes by 1)
      else{
        const UserIndex = posts[postIndex].liked_by.findIndex(user=>user === userId)
         posts[postIndex].liked_by.splice(UserIndex,1)
         posts[postIndex].likes -= 1
         await db.write(postfile,posts)
         res.status(200).json({message: `${userId} numbered User UnLiked the post under id of ${id}`})
      }
    } catch (error) {
      next(error)
    }
  }
}