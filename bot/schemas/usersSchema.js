const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    user_id: Number,
    accounts: {
        type: mongoose.Schema.Types.Array,
    }
})

const RobloxUsers = mongoose.model('User', userSchema, 'Users')

module.exports = {
    RobloxUsers,
}