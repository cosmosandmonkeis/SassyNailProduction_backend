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
async function autoConfirm(appointmentID, newStatus, adminMessage ) {
    // only works 10 digit numbers exlcusively ex: 510 123 4312
    const regex = /(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
    const updated_appointment = await Appointment.findByIdAndUpdate(appointmentID, {
        status: newStatus,
        adminMessage: adminMessage
    }, {new: true})

    let phone_num = updated_appointment.serviceType

    // apply regex to string
    phone_num = phone_num.match(regex)

    if (phone_num !== null) {
        console.log('Before: ' + phone_num)

        // remove any non-parenthses or dashes etc...
        phone_num = phone_num[0].replace(/\D/g, '')

        // reintroduce 1 back into beginning for Vonage
        if (phone_num.charAt(0) !== '1') {
            phone_num = '1'.concat(phone_num)
            console.log("attaching 1 before")
        }
        console.log('After: ' + phone_num)
        const from = process.env.FROM
        const text = `Your appointment at Sassy Nails Spa Oakland has been ${newStatus}!
                    Appointment Date:${updated_appointment.createdAt}`

        vonage.message.sendSms(from, phone_num, text, (err, responseData) => {
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
    }
}

module.exports = {
    Query: {
        async getAppointmentBookings(_, __, context) {
            const user = checkAuth(context)
            const databaseUser = await User.findById(user.id)

            if (databaseUser.admin === false)
                throw new Error('User does not have required privileges')

            try {
                return await Appointment.find().sort({'_id': -1})
            } catch (err) {
                throw new Error(err)
            }
        },
        async getUnconfirmedBookings(_, __, context) {
            const user = checkAuth(context)
            const databaseUser = await User.findById(user.id)

            if (databaseUser.admin === false)
                throw new Error('User does not have required privileges')


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
                vonage.message.sendSms(from, to1, text, (err, responseData) => {
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

                await autoConfirm(
                    createdAppointment.id,
                    'confirmed',
                   'Appointment confirmed! See you then!'
                )

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
                // only works 10 digit numbers exlcusively ex: 510 123 4312
                const regex = /(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
                const updated_appointment = await Appointment.findByIdAndUpdate(appointmentID, {
                    status: newStatus,
                    adminMessage: adminMessage
                }, {new: true})

                let phone_num = updated_appointment.serviceType

                // apply regex to string
                phone_num = phone_num.match(regex)

                if (phone_num !== null) {
                    console.log('Before: ' + phone_num)

                    // remove any non-parenthses or dashes etc...
                    phone_num = phone_num[0].replace(/\D/g, '')

                    // reintroduce 1 back into beginning for Vonage
                    if (phone_num.charAt(0) !== '1') {
                        phone_num = '1'.concat(phone_num)
                        console.log("attaching 1 before")
                    }
                    console.log('After: ' + phone_num)
                    const from = process.env.FROM
                    const text = `Your appointment at Sassy Nails Spa Oakland has been ${newStatus}!
                    Appointment Date:${updated_appointment.createdAt}`

                    vonage.message.sendSms(from, phone_num, text, (err, responseData) => {
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
                    console.log(phone_num)
                }
                return updated_appointment
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
