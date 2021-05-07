const express = require('express')

const reminderController = require('../controllers/reminderController')

const router = express.Router()

router
    .route('/')
    .get(reminderController.getAllReminders)
    .post(reminderController.createReminder)

module.exports = router