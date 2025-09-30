import { db } from "../helpers/index.js"
import { v4 as uuidv4 } from 'uuid'
import { userfile } from "../helpers/index.js"

export const usersController = {
  create: async function (req, res, next) {
    try {
      const users = await db.read(userfile)
      const newUser = req.body
      //add unique logic here on email

      const emailExists = users.find(user => user.email === newUser.email)
      if (emailExists) {
        return res.status(409).send({ message: "Email already exists!" })
      }
      newUser.id = uuidv4()

      users.push(newUser)

      await db.write(userfile, users)

      res.status(201).send(newUser)
    } catch (error) {
      next(error)
    }
  },
  update: async function (req, res, next) {
    try {
      const users = await db.read(userfile)
      const { id } = req.params
      const userIndex = users.findIndex(user => user.id === id)
      // email has to be unique

      if (req.body.email) {
        const emailExists = users.find(user => user.email === req.body.email)
        if (emailExists) {
          return res.status(409).send({ message: "Email already exists!" })
        }
      }

      if (userIndex === -1) {
        return res.status(404).send({ message: `#${id} User not found!` })
      }
      // const updatedUser = { ...users[userIndex], ...req.body }
      // const updatedUser = Object.assign(users[userIndex], req.body)
      users.splice(userIndex, 1, { ...users[userIndex], ...req.body })
      const updatedUser = users[userIndex]
      await db.write(userfile, users)

      res.send(updatedUser)
    } catch (error) {
      next(error)
    }
  },
  delete: async function (req, res, next) {
    try {
      const { id } = req.params
      const users = await db.read(userfile)
      const userIndex = users.findIndex(user => user.id === id)

      if (userIndex === -1) {
        return res.status(404).send({ message: `#${id} User not found!` })
      }

      users.splice(userIndex, 1)
      await db.write(userfile, users)
      res.status(200).send(`User is successfully deleted!`)
    } catch (error) {
      next(error)
    }
  },
  find: async function (req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query
      let users = await db.read(userfile)


      if (search) {
        users = users.filter(user =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.phone.toLowerCase().includes(search.toLowerCase())
        )
      }

      const startIndex = (page - 1) * limit
      const endIndex = page * limit

      const paginatedUsers = users.slice(startIndex, endIndex)

      res.send({
        users: paginatedUsers,
        total: users.length,
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
      const users = await db.read(userfile)
      const user = users.find(user => user.id === id)

      if (!user) {
        return res.status(404).send({ message: `#${id} User not found!` })
      }

      res.send(user)

    } catch (error) {
      next(error)
    }
  }
}