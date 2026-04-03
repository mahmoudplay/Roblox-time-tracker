const mongoose = require('mongoose')

const buttonSchema = new mongoose.Schema({
    btn_customId: String,
    commandName: String,
})

const Buttons = mongoose.model('Buttons', buttonSchema, 'Buttons');

module.exports = {
    Buttons,
}