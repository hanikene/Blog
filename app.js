var express               = require("express"),
    app                   = express(),
    mongoose              = require('mongoose'),
    bodyParser            = require('body-parser'),
    methodOverride        = require("method-override"),
    expressSanitizer      = require('express-sanitizer'),
    flash                 = require("connect-flash"),
    passport              = require("passport"),
    localStrategy         = require("passport-local"),
    User                  = require("./model/user");

var indexRoute            = require('./routes/index'),
    blogRoute             = require('./routes/blog'),
    commentRoute          = require("./routes/comment");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine", "ejs");
mongoose.connect(process.env.dbURL, {useNewUrlParser: true});

app.use(require("express-session")({
	secret: process.env.secret,
	resave: false, 
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.authenticate('local', { successFlash: 'Welcome back !'});

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.success     = req.flash('success');
	res.locals.error       = req.flash('error');
	next();
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.use("/", indexRoute);
app.use("/blog", blogRoute);
app.use("/blog/:id/comment", commentRoute);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("server connected");
});