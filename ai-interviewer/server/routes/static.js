const express  = require("express")
const staticRouter = express.Router()
const {handleRenderHomePage} = require("../controllers/static")

staticRouter.get("/",handleRenderHomePage)

module.exports = staticRouter