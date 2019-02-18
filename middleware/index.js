var Comment    = require("../model/comment"),
    Blog       = require('../model/blog'),
    middleware = {};

middleware.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
	    req.flash('error', "you need to be logged in to do that");
		res.redirect("/login");
	}
};

middleware.isAuthor = function(req, res, next) {
    if (req.isAuthenticated()) {
        Blog.findById(req.params.id, function(err, blog) {
           if (err || !blog) {
               req.flash("error", "post not found");
    	    	res.redirect('back');
           } else {
               if(blog.author.id.equals(req.user._id)) {
                    return next();
               } else {
                   req.flash("error", "you don't have the permission to do that");
                   res.redirect("back");
               }
           }
        });
    } else {
        req.flash('error', "you need to be logged in to do that");
        res.redirect('/login');
    }
};

middleware.isAuthorComment = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.idc, function(err, comment) {
           if (err || !comment) {
               req.flash("error", "comment not found");
    	    	res.redirect('back');
           } else {
               if(comment.author.id.equals(req.user._id)) {
                    return next();
               } else {
                   req.flash("error", "you don't have the permission to do that");
                   res.redirect("back");
               }
           }
        });
    } else {
        req.flash('error', "you need to be logged in to do that");
        res.redirect('/login');
    }
};

module.exports = middleware;