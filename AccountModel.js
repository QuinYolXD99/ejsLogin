const mongoose = require('mongoose')
const Schema = mongoose.Schema

let accountSchema =new Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    position: {
        type: String
    },
    admin: {
        type: Boolean
    },
    password: {
        type: String
    }
}, {
    collection: "users"
});

module.exports = mongoose.model('Account', accountSchema);
