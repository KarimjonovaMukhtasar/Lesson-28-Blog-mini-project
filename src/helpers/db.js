// write aysnc dynamic function for read and write file 1. users 2. posts 3. comments

// use fs/promises module
import fs from "fs/promises"
import path from "path"

const dbPath = path.join(process.cwd(), "src", "db")

async function readData(fileName) {
  const filePath = path.join(dbPath, fileName)
  const data = await fs.readFile(filePath, "utf-8")
  return JSON.parse(data)
}

async function writeData(fileName, data) {
  const filePath = path.join(dbPath, fileName)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

export const db = {
  read: readData,
  write: writeData,
}
// db.write("users.json", [{ id: 1, name: "john" }])
// db.read("users.json").then(data => console.log(data))