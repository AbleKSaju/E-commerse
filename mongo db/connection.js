const mongoose=require('mongoose')

module.exports={
    connect(){
        mongoose.connect(process.env.mongoDB_URL,{
            useNewUrlParser:true,useUnifiedTopology:true
        }).then((data)=>{
            console.log("Database Connected");
        }).catch((err)=>{
            console.log("DB not Connected ",err);
        })
    }
}