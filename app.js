/*
 * Trivia Game - Main server
 */

//Required packages
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

//App uses ejs to render views in views folder
//app.set("view engine", "ejs");

//Body parser for requests
app.use(bodyParser.urlencoded({extended: true}));

//Allows use of static files in public directory (css, images)
app.use(express.static(path.join(__dirname, "public")));





/******************** SERVER ROUTES ********************/
/*
 * LISTEN route
 * process.env.port listens for live server
 * local port 3000 for testing
 *
 */
app.listen(process.env.PORT || "3000", function(req, res){

  console.log("Listening on web server or localhost:3000)");
});





/*
 * GET routes
 *
 */
 //Home route
app.get("/", function(req, res){

  res.sendFile(path.join(__dirname, "views/index.html"));
});
