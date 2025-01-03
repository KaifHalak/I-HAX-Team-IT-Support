import mainRouter from "../config/serverSettings.js"

import authRouter from "./routes/auth.route.js"
import { GetNewsSource } from "./controllers/newsSources.controller.js"

mainRouter.get("/api/data", GetNewsSource)
mainRouter.use("/auth", authRouter)