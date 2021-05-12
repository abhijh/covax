const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { MONGO_IP, MONGO_PORT, MONGO_USER, MONGO_PASSWORD } = require("./config/core")
const reminderRouter = require('./routes/reminderRoutes')
const reminderService = require('./services/reminderService')

const app = express()
const port = process.env.PORT || 3000

const mongoUrl = `mongodb://${MONGO_USER}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_IP}:${MONGO_PORT}/covax?authSource=admin`
const connectWithRetry = () => {
    mongoose.connect(mongoUrl, {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false
    })
        .then(() => console.log('Connected to DB successfully!'))
        .catch((e) => {
            console.log(e)
            setTimeout(connectWithRetry, 5000)
        });
}
connectWithRetry()
reminderService.scheduleReminders()
    .then(() => console.log("scheduled reminders"))
app.enable("trust proxy")
app.use(express.json())
app.use(cors({

}))

app.get('/api/v1', (req, res) => {
    res.send('Up and Running!!')
})
app.use('/api/v1/reminders', reminderRouter)

app.listen(port, () => console.log(`Running on port ${port}`));
