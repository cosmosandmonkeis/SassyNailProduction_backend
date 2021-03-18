const { model, Schema } = require('mongoose')

const appointmentSchema = new Schema({
    createdAt: String,
    serviceType: String,
    confirmed: Boolean
})

module.exports = model('appointments', appointmentSchema)
