const express = require("express")
const app = express()
const port = 8080
const cors = require("cors")

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

app.get("/", cors(), async (req, res) => {
    res.send("This is working")
})

app.post("/gallery", cors(), async (req, res) => {
    const image = Buffer.from(req.body.Image).toString('base64');
    res.send("POST recieved: " + JSON.stringify(req.body))
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})