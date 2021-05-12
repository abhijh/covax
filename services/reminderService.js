const Reminder = require('../models/reminderModel')
const moment = require('moment')
const axios = require('axios')
const nodemailer = require("nodemailer");
const json2csv = require("json2csv")
const randomUseragent = require('random-useragent');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env['EMAIL_USERNAME'],
      pass: process.env['EMAIL_PASSWORD'],
    },
  });

exports.scheduleReminders = async () => {
    try {
        const reminders = await Reminder.find()
        scheduleAll(reminders)
    } catch(e) {
        console.log("could not fetch reminders from db", e)
    }
}

const scheduleAll = (reminders) => {
    reminders.forEach((r) => scheduleOne(r));
}

const sendMail = (email, csv) => {
    transporter.sendMail(
        {
          from: "Abhinav Jha",
          to: email,
          subject: "Slots available for COVID vaccine",
          text: "Hey, PFA for the slots 😊",
          html: "<b>Hey, PFA for the slots 😊</b>",
          attachments: [
            {
              filename: "slots.csv",
              content: csv,
            },
          ],
        },
        (err, info) => {
          if (err) {
            console.log("Error occurred. " + err.message);
          }
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
      );
}

const postProcess = (availableSlots, districtCode, email) => {
    if(availableSlots.length > 0) {
        console.log(`Found slots for district ${districtCode}`)
        console.log(`Sending mail to ${email}`)
        const csv = json2csv.parse(availableSlots);
        sendMail(email, csv)      
    } else {
        console.log(`No slots for district ${districtCode}`)
    }
}

const scheduleOne = (r) => {
    const { minAgeLimit, interval, email, districtCode } = r
    console.log("Scheduling for ", minAgeLimit, interval, email, districtCode)
    const f = async () => {
        const date = moment().format('DD-MM-YYYY')
        const availableSlots = []
        const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtCode}&date=${date}`
        try {
            const response = await axios.get(url, {
                headers: { 'User-Agent': randomUseragent.getRandom() }
            })
            response.data.centers.forEach(center => {
                const currentAvailableSlots = center.sessions
                    .filter(s => s.available_capacity > 0 && s.min_age_limit === minAgeLimit)
                    .map(s => {
                        s.center_name = center.name
                        s.address = center.address
                        s.state = center.state_name
                        s.district = center.district_name
                        s.pinCode = center.pincode
                        s.lat = center.lat
                        s.long = center.long
                        return s
                    })
                availableSlots.push(...currentAvailableSlots)
            })
            postProcess(availableSlots, districtCode, email)
        } catch(err) {
            console.log(`Failed to fetch availibility ${err}`)
        }
    }
    setInterval(f, interval * 1000)
}
