const mongoose = require("mongoose")

const reminderSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    pinCode: {
        type: Number,
        required: true
    },
    minAgeLimit: {
        type: Number,
        default: 45
    },
    interval: {
        type: Number,
        default: 60
    },  
})

const Reminder = mongoose.model("Reminder", reminderSchema)
module.exports = Reminder