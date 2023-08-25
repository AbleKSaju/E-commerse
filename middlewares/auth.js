const user=require('../model/user-model')
const isLogged=((req,res,next)=>{
    if(req.session.user){
        user.findById({_id:req.session.user}).lean()
        .then((data)=>{
            if(data.verified==0){
              next()
            }else{
                res.session.user=null
                req.session.isLogged=null
                res.redirect('/login')
            }
        })
    }else{
        res.redirect('/login')
    }
})
module.exports={
    isLogged,
}