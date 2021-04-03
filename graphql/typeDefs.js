const {gql} = require('apollo-server')

module.exports = gql`
    type User {
        id: ID
        token: String
        admin: Boolean
        username: String
        email: String
        phonenumber: String
        bookingsHistory : [AppointmentBooking]
        createdAt: String
    }

    type Services {
        id: ID
        title: String
        price: Float
        description: String
        category: String
        date: String
    }

    type AppointmentBooking {
        id: ID
        createdAt: String
        serviceType : String
        status: String
        adminMessage: String
    }


    input RegisterInput {
        username: String
        password: String
        confirmPassword: String
        email: String
        phonenumber: String
    }

    input ServiceInput {
        title: String
        price: Float
        description: String
        category: String
    }

    input inputID {
        id: ID!
    }

    type Query {
        getUsers: [User]
        getAUser(username: String!) : User
        getServices: [Services]
        getServiceCategory(category: String!): [Services]
        getAService(serviceID: ID!): Services
        getAppointmentBookings: [AppointmentBooking]
        getUserBookingsHistory(username: String!): [AppointmentBooking]
        getUnconfirmedBookings : [AppointmentBooking]
    }

    type Mutation {
        login(username: String!, password: String!): User
        register(registerInput: RegisterInput): User
        addService(serviceInput: ServiceInput): Services
        deleteService(serviceID: ID!): Services
        createAppointmentBooking(description: String!, serviceDate : String!): AppointmentBooking
        deleteAppointmentBooking(appointmentID: ID!): AppointmentBooking
        updateAppointmentBooking(appointmentID: ID!, newStatus: String!, message: String) : AppointmentBooking
    }

    type Subscription {
        newBookings: AppointmentBooking
    }
`
