const express               = require('express'),
      app                   = express(),
      passport              = require('passport'),
      LocalStrategy         = require('passport-local'),
      flash                 = require('connect-flash'),
      methodOverride        = require('method-override'),
      body                  = require('body-parser'),
      User                  = require('./models/user.js'),
      Comment               = require("./models/comments.js"),
      Post                  = require("./models/posts.js"),
      mongoose              = require('mongoose');
      mongoose.connect("mongodb+srv://rt1301:radhavilla1301@cluster0.hc7tc.mongodb.net/Forum?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex:true }).then(()=>{
        console.log("Connected to DB!");
    }).catch(err=>{
        console.log("Error: " + err.message);
    });
app.use(body.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();
// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "This is a secret message",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    next();
 });
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Root Route
app.get("/",(req,res)=>{
    Post.find({},(err,foundPosts)=>{
        if(err)
        {
            req.flash("error",err.message);
            return res.redirect("back");
        }
        else
        {
            res.render("index",{posts:foundPosts});
        }
    });
    
});
// Create Post route
app.get("/f/:id/posts/create",isLoggedIn,(req,res)=>{
    res.render("posts/new");
});
app.post("/",isLoggedIn,(req, res)=>{
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    Post.create(req.body.post,(err,newPost)=>{
        if(err)
        {
            req.flash("error",err.message);
            return res.redirect("back");
        }
        else
        {
            console.log(newPost);
            res.redirect("/");
        }
    });
    
});
// ================
// AUTH ROUTES
// ================
// show registration form
app.get("/register",function(req, res)
{
	res.render("register",{currentUser:req.user});
});
// handle sign up logic
app.post("/register",function(req,res)
{
    var newUser = new User({username: req.body.username});
    User.register(newUser,req.body.password,function(err, user)
    {
		if(err)
			{
				req.flash("error",err.message);
				return res.render("register",{currentUser:req.user});
            }
        else
        {
            passport.authenticate("local")(req, res, function()
            {
               req.flash("success","Registration completed");
               res.redirect("/login");
            });
        }
	});
});

// show login form
app.get("/login",function(req, res){
    res.render("login",{currentUser:req.user});
});
// handle login logic
app.post("/login",passport.authenticate("local",
{
failureRedirect: "/login",
failureFlash:"Incorrect Username or Password!",
successRedirect:"/",
}),function(req, res)
{
    req.flash("success","You are logged in as " + req.user.username);
});
// LOGOUT 
app.get("/logout",function(req, res)
{
    req.logout();
    req.flash("success","You are successfully logged out");
	res.redirect("/login");
});
// Logged in middleware
function isLoggedIn(req, res, next)
{
	if(req.isAuthenticated())
		{
			return next();
        }
    req.flash("error","Please Login First");
	res.redirect("/login");	
		
}
app.listen(3000,()=>{console.log('Server is running')});