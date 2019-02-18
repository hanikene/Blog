var express    = require("express"),
    router     = express.Router({mergeParams: true}),
    Blog       = require('../model/blog'),
    Comment    = require("../model/comment"),
    middleware = require("../middleware/");
    

router.get("/new", middleware.isLoggedIn, function(req, res) {
    Blog.findById(req.params.id, function(err, blog) {
    	if (err) {
    		req.flash("error", err.message);
    		res.redirect('back');
    	} else {
    	    console.log(req.user.username + " has visited the new comment page of the post : " + blog.title);
    		res.render("comment/new", {blog: blog});
    	}
    });
});

router.post("/", middleware.isLoggedIn, function(req, res) {
    Blog.findById(req.params.id, function(err, blog) {
    	if (err) {
    		req.flash("error", err.message);
    		res.redirect('back');
    	} else {
    	    req.body.blog.Comments.content = req.sanitize(req.body.blog.Comments.content);
    	    if (!req.body.blog.Comments.content) {
                req.flash("error", "invalid comment: content can't be empty");
                res.redirect('back');
            } else {
                Comment.create(req.body.blog.Comments, function(err, comment) {
                    if (err) {
                        req.flash("error", err.message);
            		    res.redirect('back');
                    } else {
                        comment.author.id = req.user._id;
                        comment.author.username = req.user.username;
                        comment.save();
                        blog.Comments.push(comment);
                        blog.save(function(err, data) {
                            if (err) {
        					    req.flash("error", err.message);
        	                   	res.redirect('back');
                            } else {
                                console.log(req.user.username + " has added the new comment page of the post : " + blog.title + " (" + comment.content + ")");
                                req.flash("success", "comment added");
                            	res.redirect("/blog/" + req.params.id);
                            }
                        });
                	}
                });
            }
    	}
    });
});

router.get("/:idc/edit", middleware.isAuthorComment, function(req, res) {
    Comment.findById(req.params.idc, function(err, comment) {
        if (err || !comment) {
            req.flash("error", "comment not found");
    		res.redirect('back');
        } else {
            Blog.findById(req.params.id, function(err, blog) {
                if (err || !blog) {
                    req.flash("error", "blog not found");
    	        	res.redirect('back');
                } else {
                    console.log(req.user.username + " has visited the edit comment page of the post : " + blog.title + " (" + comment.content + ")");
                    res.render("./comment/edit", {blog: blog, comment: comment});
                }
            });
        }
    });
});

router.put("/:idc", middleware.isAuthorComment, function(req, res) {
    req.body.comment.content = req.sanitize(req.body.comment.content);
    if (!req.body.comment.content) {
        req.flash("error", "invalid comment: content can't be empty");
        res.redirect('back');
    } else {
        Comment.findByIdAndUpdate(req.params.idc, req.body.comment, function(err, blog) {
            if (err) {
                req.flash("error", err.message);
        		res.redirect('back');
            } else {
                console.log(req.user.username + " has updated a comment of the post : " + blog.title + " (" + req.body.comment.content + ")");
                req.flash("success", "comment updated");
                res.redirect("/blog/" + req.params.id);
            }
        });
    }
});

router.delete('/:idc', middleware.isAuthorComment, function(req, res) {
    Comment.findByIdAndRemove(req.params.idc, function(err, comment) {
        if (err) {
            req.flash("error", err.message);
    		res.redirect('back');
        } else {
            console.log(req.user.username + " has deleted a comment");
            req.flash("success", "comment deleted");
            res.redirect('/blog/' + req.params.id);
        }
    });
});

module.exports = router;