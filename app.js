//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser= require("body-parser");
const ejs= require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-Local-mongoose");

const app= express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);

const User= new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done){
  done(null, user.id);
});
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/prod",function(req,res){
  res.render("year");
});
app.get("/cse",function(req,res){
  res.render("year");
});
app.get("/ece",function(req,res){
  res.render("year");
});
app.get("/eee",function(req,res){
  res.render("year");
});
app.get("/ice",function(req,res){
  res.render("year");
});
app.get("/chemical",function(req,res){
  res.render("year");
});
app.get("/mech",function(req,res){
  res.render("year");
});
app.get("/civil",function(req,res){
  res.render("year");
});
app.get("/mme",function(req,res){
  res.render("year");
});
app.get("/archi",function(req,res){
  res.render("year");
});

app.get("/secrets", function(req, res){
  User.find({"secret":{$ne: null}}, function(err, foundUsers){
    if(err){
      console.log(err);
    }
    else{
      if(foundUsers){
        res.render("secrets", {userWithSecrets: foundUsers});
      }
    }
  });
});

app.get("/submit", function(req,res){
  if(req.isAuthenticated()){
    res.render("submit");
  }
  else{
    res.redirect("/login");
  }
});

app.post("/submit", function(req,res){
  const submittedSecret = req.body.secret;
  User.findById(req.user.id, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        foundUser.secret = submittedSecret;
        foundUser.save(function(){
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.get("/logout", function(req,res){
  req.logout(function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/");
    }
  });
});

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(3000,function(){
  console.log("Server is started on port 3000...");
});
