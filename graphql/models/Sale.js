const {model, Schema} = require('mongoose')

const saleSchema = new Schema({
    customerName: String,
    partySize: Number,
    saleDate: Date,
    totalPrice: Number,
    tipPrice: Number,
    paymentMethod: String,
    employees: [String],
    services: [
        {
            type: Schema.Types.ObjectId,
            ref: 'services'
        }
    ]
})

module.exports = model('sales', saleSchema)
