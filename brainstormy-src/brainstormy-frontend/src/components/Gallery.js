import {React, useEffect, useState} from 'react'
import { Button, Grid, Paper, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import "./Gallery.css";
import CardItem from "./CardItem"

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

function Gallery() {
   const [blogs, setBlogs] = useState([])

    useEffect(async () => {
      await axios.get("http://localhost:8080/blogs")
        .then((res) => setBlogs(res.data));
    }, []);
    return (
      <div className="cards">
        <h1>Gallery</h1>
        <div className="cards__container">
          <div className="cards__wrapper">
            <ul className="cards__items">
            {blogs.map((blog, index) => (
              <Grid item xs={1} sm={1} md={1} key={index}>
              <CardItem
                src={blog.image}
                text={`Created by ${blog.author}`}
                title="Inspiration"
              />
              </Grid>
            ))}
              {/* <CardItem
                src="images/aboutImg.png"
                text="Inspired by Waifu Labs, we created Ganime, a web application that uses a generative adversarial network (GAN) to generate new images of anime backgrounds."
                title="Inspiration"
              />
              <CardItem
                src="images/meetImg.jpg"
                text="Nick, Dan, and Charlie worked on the GAN.  Vince and Vardan worked on the Frontend.  Evan worked on the Backend. "
                title="Meet the team"
              /> */}
            </ul>
          </div>
        </div>
      </div>
    );

  //   <Grid
  //     container
  //     spacing={{ xs: 2, md: 3 }}
  //     columns={{ xs: 5, sm: 5, md: 5 }}
  //   >
  //     {blogs.map((blog, index) => (
  //       <Grid item xs={1} sm={1} md={1} key={index}>
  //         <Item>{blog.author}</Item>
  //         <img id={index} src={`${blog.image}`}></img>
  //       </Grid>
  //     ))}
  //   </Grid>
}

export default Gallery