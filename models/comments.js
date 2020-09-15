const mongoose = require('mongoose');
const commentSchema = mongoose.Schema({
    text: String,
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    vote: {
        type:Number,
        default: 0
    },
    parents: Array
});
module.exports = mongoose.model("Comment",commentSchema);