var express    = require("express"),
    router     = express.Router(),
    Blog       = require('../model/blog'),
    middleware = require('../middleware/');
    
router.get("/", function(req, res) {
    Blog.find({}, function(err, blogs) {
    	if (err) {
         	req.flash("error", err.message);
         	res.redirect('back');
    	} else {
    	    if (req.user) {
    	        console.log(req.user.username + " has visited the home page");
    	    } else {
    	        console.log("someone has visited the home page");
    	    }
          	res.render("post/index", {blogs: blogs});
    	}
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
    console.log(req.user.username + " has visited the new post page");
    res.render("post/new");
});

router.post("/", middleware.isLoggedIn, function(req, res) {
    req.body.blog.content = req.sanitize(req.body.blog.content);
    if (!req.body.blog.content) {
        req.flash("error", "invalid post: content can't be empty");
        res.redirect('back');
    } else if (req.body.blog.title === "") {
        req.flash("error", "invalid post: title can't be empty");
        res.redirect('back');
    } else {
        Blog.create(req.body.blog, function(err, blog) {
        	if (err) {
        		req.flash("error", err.message);
        		res.redirect('back');
        	} else {
        	    console.log(req.user.username + "  created a new post: " + blog.title);
        	    blog.author.username = req.user.username;
        	    blog.author.id = req.user._id;
        	    blog.save();
        	    req.flash("success", "new post added");
        		res.redirect("/blog");
        	}
        });
    }
});

router.get("/:id", function(req, res) {
    Blog.findById(req.params.id).populate("Comments").exec(function(err, blog) {
    	if (err || !blog) {
    		req.flash("error", "blog not found");
    		res.redirect('back');
    	} else {
    	    if (req.user) {
    	        console.log(req.user.username + " has visited the post: " + blog.title);
    	    } else {
    	        console.log("someone has visited the post: " + blog.title);
    	    }
    		res.render("post/show", {blog: blog});
    	}
    });
});

router.get("/:id/edit", middleware.isAuthor, function(req, res) {
    Blog.findById(req.params.id, function(err, blog) {
    	if (err) {
    		req.flash("error", err.message);
    		res.redirect('back');
    	} else {
    	    console.log(req.user.username + " has visited the post edit of: " + blog.title);
    		res.render("post/edit", {blog: blog});
    	}
    });
});

router.put("/:id", middleware.isAuthor, function(req, res) {
    req.body.blog.content = req.sanitize(req.body.blog.content);
    if (!req.body.blog.content) {
        req.flash("error", "invalid post: content can't be empty");
        res.redirect('back');
    } else if (req.body.blog.title === "") {
        req.flash("error", "invalid post: title can't be empty");
        res.redirect('back');
    } else {
        Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog) {
            if (err) {
                req.flash("error", err.message);
        		res.redirect('back');
            } else {
                console.log(req.user.username + " has updated the post: " + blog.title);
                req.flash("success", "post updated");
                res.redirect("/blog/" + req.params.id);
            }
        });
    }
});

router.delete("/:id", middleware.isAuthor, function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err, blog) {
        if (err) {
            req.flash("error", err.message);
    		res.redirect('back');
        } else {
            console.log(req.user.username + " has deleted a post");
            req.flash("success", "post deleted");
            res.redirect("/blog");
        }
    });
});

module.exports = router;