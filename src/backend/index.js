const express = require("express")
const app = express()
const port = 8080
const cors = require("cors")
const fs = require('fs');

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

app.get("/", cors(), async (req, res) => {
    res.send("This is working")
})

app.post("/gallery", cors(), async (req, res) => {
    const image = req.body.Image
    fs.writeFileSync('./image.txt', image)
    res.send("POST recieved: " + image)
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})