import mainRouter from "../config/serverSettings.js"

import authRouter from "./routes/auth.route.js"

mainRouter.use("/auth", authRouter)