var express  = require("express"),
    router   = express.Router(),
    passport = require("passport"),
    User	 = require('../model/user');

router.get("/", function(req, res) {
	res.render("home");
});

router.get('/register', function(req, res) {
	console.log("someone visited the register link");
    res.render('register');
});

router.post("/register", function(req, res) {
	if (req.body.password !== req.body.password2) {
		req.flash("error", "passwords are not the same");
    	res.redirect('back');
	} else {
		User.register(new User({username: req.body.username}), req.body.password, function(err, user){
			if (err) {
				req.flash("error", err.message);
	    		res.redirect('back');
			} else {
				console.log(req.body.username + " has registered");
				passport.authenticate("local")(req, res, function() {
					req.flash("success", "welcome among us " + user.username);
					res.redirect("/blog");
				});
			}
	    });
	}
});

router.get('/login', function(req, res) {
	console.log("someone visited the login link");
    res.render('login');
});

router.post("/login", passport.authenticate("local", {
	successRedirect: "/blog",
	failureRedirect: "/login",
	failureFlash: true
}), function(req, res) {
});

router.get("/logout", function(req, res) {
	if (req.user) {
		console.log(req.user.username + " has logged out");
	}
	req.logout();
	req.flash("success", "goodbye");
	res.redirect("/blog");
});

module.exports = router;