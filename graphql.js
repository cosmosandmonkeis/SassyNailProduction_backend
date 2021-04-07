
require('dotenv').config()

const { ApolloServer } = require('apollo-server-lambda');

const mongoose = require('mongoose')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const MONGO_DB = process.env.MONGO_DB

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        return {req}
    }
})

mongoose.connect(MONGO_DB.toString(), {useNewUrlParser: true, useUnifiedTopology: true})

exports.graphqlHandler = server.createHandler();
