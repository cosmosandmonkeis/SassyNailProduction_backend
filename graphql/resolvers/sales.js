const Sales = require('../models/Sale')
const User = require('../models/User')
const checkAuth = require('../../utils/checkAuth')

/* Special Datatype: Service
* services are offered salon services such as waxing manicures pedicures etc...
*
    title: String => specific service of specified category
    price: Float
    description: String
    category: String => general category such as waxing/manicure/pedicure
    date: String => when this service was added
    user (creator): who created this service (admin only access)
* */

module.exports = {
    Query: {

    },
    Mutation: {
        /*
        * adds a Service object to mongodb
        * title(string), price(float), descr(string), category(String), context(browser header) -> service added(Service)
        * features: checks context if authorization token provided and user privileges provided,
        * checks if input service title is already added,
        * */
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

            console.log('everything all good')
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
