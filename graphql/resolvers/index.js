const serviceResolvers = require('./services')
const usersResolvers = require('./users')
const appointmentbookingResolvers = require('./appointmentbooking')
const salesResolvers = require('./sales')
module.exports = {
    User: {
        ...usersResolvers.User,
    },
    Query: {
        ...serviceResolvers.Query,
        ...usersResolvers.Query,
        ...appointmentbookingResolvers.Query,
        ...salesResolvers.Query
    },
    Mutation: {
        ...serviceResolvers.Mutation,
        ...usersResolvers.Mutation,
        ...appointmentbookingResolvers.Mutation,
        ...salesResolvers.Mutation
    },

}
