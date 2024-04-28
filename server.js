const express = require("express");
const authsRoutes = require("./routes/auths.js");
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser'); 
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');


const authRoutes = require("./routes/auth.js");
const paymentRoutes = require("./routes/payment.js")
const productsRoutes = require("./routes/products.js");
const OrderRoutes = require("./routes/order.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require('axios');

require('dotenv').config();








// Check if the MONGO_URI environment variable is defined
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to mongodb");

    const app = express();

    app.use(express.json());
    app.use(cors({
      credentials: true,
      origin: ['http://localhost:3000', "https://cravings-flax.vercel.app"],
      methods: "GET,POST,PUT,DELETE",
    }));

    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60 * 60 * 1000, // 1 hour
        secure: true, // set to true if using HTTPS
        httpOnly: true, // prevents client-side JavaScript from accessing the cookie
        sameSite: 'none' // set the SameSite attribute to 'None'
      }
    }));
    

    // connect passport middleware to the Express application


    app.use("/auths", authsRoutes);
   

    app.use("/order", OrderRoutes);
    app.use(bodyParser.json());
    app.use(cors());
    
    console.log('Middleware set up successfully');
    
    // Use payment routes
    app.use("/payment", paymentRoutes);
    
    console.log('Routes set up successfully');
  
    app.use("/auth", authRoutes);

    app.use("/products", productsRoutes);

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret:process.env.GOOGLE_SECRET,
          callbackURL: 'http://localhost:8080/auth/google/callback'
        },
        async (accessToken,refreshToken,profile,done) =>{

        }
      )
    );

    // Save user into session (cookie)
    passport.serializeUser((user,done) =>{
      done(null,user)
    });


    // Save user into session (cookie)
    passport.deserializeUser((user,done) =>{
      done(null,user)
    });

    // setting up the session middleware

    app.use(session({
      secret:process.env.SESSION_SECRET,
      resave:true,
      saveUninitialized:true,
      cookie:{maxAge:1000*60*60}
    }))

    app.use(passport.initialize());
    app.use(passport.session());


    app.get('/' ,(req,res) => {
      res.send('<h1>Please Navigate to /auth/google to login</h1>')
    })


    app.get('/auth/google', passport.authenticate('google',{scope: ['profile'] }));
     


    app.get('/auth/google/callback', passport.authenticate('google',{failureRedirect:'/'}),
    (req,res) => {
      res.redirect('/profile');
    })


    // Display the user Profile

    app.get('/profile', (req,res) =>{
     if(req.isAuthenticated()){
res.send(`<h1>You are logged</h1><span>${JSON.stringify(req.user,null,2)}</span>`)

     }else{
      res.redirect('/')
     }

    })

// Logout the user
app.get('/logout', (req,res) =>{
  req.logOut();
  res.redirect('/');
})


app.listen(8080, () => {
      console.log(`Now listening to port 8080`);
    });
  })
  .catch((error) => {
    console.log({ error });
    throw new Error(error);
  });
