require('dotenv').config()
const Appointment = require('../models/AppointmentBooking')
const checkAuth = require('../../utils/checkAuth')
const User = require('../models/User')
const {validateAppointmentInput} = require("../../utils/validators");
const {UserInputError} = require('apollo-server')

const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
    apiKey: process.env.APIKEY,
    apiSecret: process.env.APISECRET
})

/* Special Datatype: AppointmentBooking
*   status: String, => Unconfirmed, accepted, denied
    createdAt: String, => Date of when appointment was created
    serviceType: String => a string description of what was booked
    * status: String => confirmed or denied
    * adminMessage: String => admin message for confirmation or denial
    * ,*/

module.exports = {
    Query: {
        async getAppointmentBookings() {
            try {
                return await Appointment.find().sort({'_id': -1})
            } catch (err) {
                throw new Error(err)
            }
        },
        async getUnconfirmedBookings() {
            try {
                return await Appointment.find({
                    status: "unconfirmed"
                })
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        /* creates an appointment booking given description
        * (description) String, serviceDate(String) -> AppointmentBooking
        * serviceDate is assuming everything is proper ISO date string
        * */
        createAppointmentBooking: async function (_, {description, serviceDate}, context) {

            const user = checkAuth(context)
            const {errors, valid} = validateAppointmentInput(description, serviceDate)
            if (!valid) {
                throw new UserInputError('Appointment booking validation error', {errors})
            }

            try {
                //create a new appointment and save
                const createdAppointment = new Appointment({
                    createdAt: serviceDate,
                    serviceType: description,
                    status: "unconfirmed",
                    adminMessage: ''
                })

                await createdAppointment.save()

                const from = process.env.FROM
                const to1 = process.env.TO1
                const to2 = process.env.TO2
                const text = `Appointment booked!
                 Date: ${serviceDate} 
                 Details: ${description}`

                // SEND SMS TO ENV PHONE NUMBERS
                vonage.message.sendSms(from, to2, text, (err, responseData) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (responseData.messages[0]['status'] === "0") {
                            console.log("Message sent successfully.");
                        } else {
                            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                        }
                    }
                })

                //update user's history of appointments
                await User.findOneAndUpdate({
                        _id: user.id
                    },
                    {
                        $push: {
                            bookingsHistory: createdAppointment.id
                        }
                    })

                //update subscription for appointment bookings
                await context.pubsub.publish('NEW_BOOKING', {
                    newBookings: createdAppointment
                })

                return createdAppointment
            } catch (err) {
                throw new Error(err)
            }

        },
        async deleteAppointmentBooking(_, {appointmentID}, context) {
            checkAuth(context)
            try {
                return await Appointment.findByIdAndDelete(appointmentID)
            } catch (err) {
                throw new Error(err)
            }
        },
        async updateAppointmentBooking(_, {appointmentID, newStatus, adminMessage}, context) {
            checkAuth(context)
            try {
                return await Appointment.findByIdAndUpdate(appointmentID, {
                    status: newStatus,
                    adminMessage: adminMessage
                }, {new: true})
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {
        newBookings: {
            subscribe: (_, __, {pubsub}) => pubsub.asyncIterator('NEW_BOOKING')
        }
    },

}
