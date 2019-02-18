var mongoose = require('mongoose');

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    content: String,
    date: {type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    Comments: [{
    	type: mongoose.Schema.Types.ObjectId,
    	ref: "Comment"
    }]
    
});
module.exports = mongoose.model("Blog", blogSchema);