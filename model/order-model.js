const mongoose=require('mongoose')

const orderModal=mongoose.Schema({
    totalPrice:{
        require:true,
        type:Number
    },
    address:{
        require:true,
        type:Array
    },
    size:{
        require:true,
        type:String,
    },
    date:{
        require:true,
        type:String
    },
    product:{
        require:true,
        type:Array
    },
    userId:{
        require:true,
        type:String
    },
    payment:{
        require:true,
        type:String
    },
    status:{
        require:true,
        type:String
    }
})
module.exports=mongoose.model("order",orderModal)