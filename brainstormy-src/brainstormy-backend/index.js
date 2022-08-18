const express = require("express")
const app = express()
const port = 8080
const cors = require("cors")
const fs = require('fs')
const mongoose = require('mongoose')
const Blog = require('./models/blog')

//Connect to MongoDB
const mongoURI = 'mongodb+srv://moomoo02:arabelle95132@brainstormydb.t50ygxb.mongodb.net/BrainstormyDB?retryWrites=true&w=majority'
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}`)
    }))
    .catch((err) => console.log(err))

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

//mongoose and mongo sandbox routes
app.get('/blogs', cors(), async (req, res) => { 
    Blog.find()
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            console.log(err)
        })
})  

app.post("/add-blog", cors(), async (req, res) => {
    const image = req.body.Image
    const author = req.body.Author
    const blog = new Blog({
        author: author,
        image: image
    })

    blog.save()
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            console.log(err)
        })

    res.send("POST recieved: " + image)
})

//routes
app.get("/", cors(), async (req, res) => {
    res.send("This is working")
})

app.get("/gallery", cors(), async (req, res) => {
    res.redirect('/blogs')
})



