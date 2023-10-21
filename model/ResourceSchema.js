const mongoose = require("mongoose")

const ResourecSchema  =new  mongoose.Schema({
    silder:[
        {
            imgs:{type:String}
        }
    ],
    news:[
        {
            head:{type:String},
            content:{type:String},
            date:{type:Date}
        }
    ],
    clubs:[
        {
            logo:{type:String},
            name:{type:String},
            members:[
                {name:{type:String}}
            ]
        }
    ]

}) 
 
const RM = mongoose.model('admin',ResourecSchema)
module.exports = RM