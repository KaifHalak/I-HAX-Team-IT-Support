import express from "express"
import http from "http"
import cors from "cors"
import bodyParser from "body-parser"

import env from "../src/utils/env.js"

import { fileURLToPath } from "url"
import path, { dirname } from "path"
const __dirname = dirname(fileURLToPath(import.meta.url))

const mainRouter = express()
const server = http.createServer(mainRouter)

mainRouter.use(express.json())
mainRouter.use(bodyParser.urlencoded({ extended: false }));
mainRouter.use(bodyParser.json());
mainRouter.use(cors())
mainRouter.use(express.json())

let PORT = env("SERVER_PORT") || 3000

server.listen(PORT, () => {
     console.log(`listening on port ${PORT}`)
})

export default mainRouter
