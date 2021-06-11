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

    type Sales {
        customerName: String
        partySize: Int
        saleDate: String
        totalPrice: Int
        tipPrice: Int
        paymentMethod: String
        employees: [String]
        services: [Services]
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

    input SaleInput {
        customerName: String
        partySize: Int
        saleDate: String
        totalPrice: Int
        tipPrice: Int
        paymentMethod: String
        employees: [String]
        services: [ID]
    }

    type Query {
        #        getUsers: [User]
        getServices: [Services]
        getServiceCategory(category: String!): [Services]
        getAService(serviceID: ID!): Services
        #        admin protected
        getAppointmentBookings: [AppointmentBooking]
        getUserBookingsHistory: [AppointmentBooking]
        getUnconfirmedBookings : [AppointmentBooking]
    }

    type Mutation {
        login(username: String!, password: String!): User
        register(registerInput: RegisterInput): User
        #        admin protected
        addService(serviceInput: ServiceInput): Services
        deleteService(serviceID: ID!): Services
        #        user protected
        createAppointmentBooking(description: String!, serviceDate : String!): AppointmentBooking
        deleteAppointmentBooking(appointmentID: ID!): AppointmentBooking
        updateAppointmentBooking(appointmentID: ID!, newStatus: String!, adminMessage: String!) : AppointmentBooking
        #        admin protected
        addSales(saleInput: SaleInput) : Sales
    }
`
