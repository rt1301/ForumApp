const mongoose = require('mongoose');
var postsSchema = new mongoose.Schema({
    title:  String,
    description: String,
    channel: String,
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment",
		}
	]
});
module.exports = mongoose.model("Post",postsSchema);