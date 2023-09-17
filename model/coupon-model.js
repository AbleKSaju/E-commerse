const mongoose =  require('mongoose');
let couponModel = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    code:{
        type:Array,
        require:true
    },
    created:{
        type:String,
        required:true
    },
    expiry:{
        type:String,
        required:true
    },
    offerPrice:{
        type:String,
        require:true
    },
    minimumPrice:{
        type:String,
        require:true,
    },
    status:{
        type:String,
        require:true
    },
    user:{
        type:Array,
    }
});

module.exports = mongoose.model('coupon' , couponModel)