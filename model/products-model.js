const mongoose=require('mongoose')
const productModal=mongoose.Schema({
    image:{
        type:Array,
        required:true
    },
    name:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    category:{
        type:String,
        require:true
    },
    regularprice:{
        type:String,
        require:true
    },
    saleprice:{
        type:String,
        require:true
    },
    createdon:{
        type:Date,
        require:true
    },
    taxrate:{
        type:String,
        require:true
    },
    units:{
        type:String,
        require:true
    },
    verified:{
        type:String,
        default:0

    }
})

module.exports=mongoose.model("product",productModal)