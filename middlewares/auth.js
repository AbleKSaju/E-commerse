const user=require('../model/user-model')
const isLogged=((req,res,next)=>{
    if(req.session.user){
        user.findById({_id:req.session.user}).lean()
        .then((data)=>{
            if(data.verified==0){
              next()
            }else{
                res.redirect('/logout')
            }
        })
    }else{
        res.redirect('/login')
    }
})

const adminLoggedIn=((req,res,next)=>{
    if(req.session.adminLoggedIn==true ){
        next()
    }else{
        res.redirect('/admin/admin-login')
    }
})

module.exports={
    isLogged,
    adminLoggedIn
}