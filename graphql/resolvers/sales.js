const Sales = require('../models/Sale')
const User = require('../models/User')
const checkAuth = require('../../utils/checkAuth')


module.exports = {
    Query: {

    },
    Mutation: {
        async addSales(_, {
            saleInput: {
                customerName,
                partySize,
                saleDate,
                totalPrice,
                tipPrice,
                paymentMethod,
                employees,
                services
            }
        }, context) {

            const user = checkAuth(context)
            const databaseUser = await User.findById(user.id)

            if (databaseUser.admin === false)
                throw new Error('User does not have required privileges')


            try {
                const newSale = new Sales({
                    customerName,
                    partySize,
                    saleDate,
                    totalPrice,
                    tipPrice,
                    paymentMethod,
                    employees,
                    services
                })
                return await newSale.save()
            } catch (err) {
                throw new Error(err)
            }

        }
    }
}
