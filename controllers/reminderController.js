const Reminder = require('../models/reminderModel')

exports.getAllReminders = async (_req, res, _next) => {
    try {
        const reminders = await Reminder.find()
        res.status(200).json({
            success: true,
            results: reminders.length,
            data: {
                reminders
            }
        })
    } catch(e) {
        res.status(400).json({
            success: false
        })
    }
}

exports.createReminder = async (req, res, _next) => {
    try {
        const reminder = await Reminder.create(req.body)
        res.status(201).json({
            success: true,
            data: {
                reminder
            }
        })
    } catch(e) {
        res.status(400).json({
            success: false,
            errors: e.errors
        })
    }
}
