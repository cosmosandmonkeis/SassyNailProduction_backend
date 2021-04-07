const { model, Schema } = require('mongoose')

const appointmentSchema = new Schema({
    createdAt: String,
    serviceType: String,
    status: String,
    adminMessage: String
})

module.exports = model('appointments', appointmentSchema)
