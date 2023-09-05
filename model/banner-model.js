const mongoose=require('mongoose')
const bannerModel=mongoose.Schema({
    
    image:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    location:{
        type:String,
        require:true
    },
    link:{
        type:String,
        require:true
    },
    date:{
        type:String,
        require:true
    }
})
module.exports=mongoose.model('banner',bannerModel)