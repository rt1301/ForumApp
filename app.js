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
// Posts Routes
// Create Post route
app.get("/f/:id/posts/create",isLoggedIn,(req,res)=>{
    res.render("posts/new");
});
app.post("/",isLoggedIn,(req, res)=>{
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var post = {title:req.body.post.title,description:req.body.post.description,channel:req.body.post.channel,author:author};
    Post.create(post,(err,newPost)=>{
        if(err)
        {
            req.flash("error",err.message);
            return res.redirect("back");
        }
        else
        {
            res.redirect("/");
        }
    });
    
});
// Show Post Route
app.get("/f/:channel/:id",isLoggedIn,(req, res)=>{
    Post.findById(req.params.id).populate("comments").exec((err,foundPost)=>{
        if(err)
        {
            req.flash("error",err.message);
            return res.redirect("back");
        }
        else
        {
            res.render("posts/show",{post:foundPost});
        }
    });
});
// Edit Post Route
app.get("/f/:channel/:id/edit",isLoggedIn,(req, res)=>{
    Post.findById(req.params.id,(err,foundPost)=>{
        if(err)
        {
            req.flash("error",err.message);
            return res.redirect("back");
        }
        else
        {
            res.render("posts/edit",{post:foundPost});
        }
    });
});
app.put("/f/:channel/:id",isLoggedIn,(req, res)=>{
    Post.findByIdAndUpdate(req.params.id,req.body.post,(err,updatedPost)=>{
        if(err)
        {
            req.flash("error",err.message);
            return res.redirect("back");
        }
        else
        {
            res.redirect("/f/"+req.params.channel+"/"+req.params.id);
        }
    });
});
// Comment Routes
app.get("/f/:channel/:id/comments/new",isLoggedIn,(req, res)=>{
    Post.findById(req.params.id,(err,foundPost)=>{
        if(err)
        {
            req.flash("error",err.message);
            return res.redirect("back");
        }
        else
        {
            res.render("comments/new",{post:foundPost});
        }
    });
});
app.post("/f/:channel/:id/comments/new",isLoggedIn,(req, res)=>{
    Post.findById(req.params.id,(err,foundPost)=>{
        if(err)
        {
            req.flash("error",err.message);
            return res.redirect("back");
        }
        else
        {
            Comment.create(req.body.comment,(err,comment)=>{
                if(err)
                {
                req.flash("error",err.message);
                return res.redirect("back");
                }
                else
                {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.parents.push(comment._id);
                    comment.markModified('parents');
                    comment.save();
                    foundPost.comments.push(comment);
                    foundPost.markModified('comments');
                    foundPost.save();
                    req.flash("success","Successfully added comment");
                    res.redirect("/f/"+req.params.channel+"/"+req.params.id);
                }
            })
        }
    })
})
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