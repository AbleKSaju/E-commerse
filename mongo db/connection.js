const mongoose=require('mongoose')

module.exports={
    connect(){
        mongoose.connect('mongodb://0.0.0.0:27017/sampl',{
            useNewUrlParser:true,useUnifiedTopology:true
        }).then((data)=>{
            console.log("Database Connected");
        }).catch((err)=>{
            console.log("DB not Connected ",err);
        })
    }
}