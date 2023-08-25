const mongoose=require('mongoose')
const categoryModal=mongoose.Schema({
    
    image:{
        type:String,
        require:true
    },
    name:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    verified:{
        type:String,
        default:0
    }
})
module.exports=mongoose.model('category',categoryModal)