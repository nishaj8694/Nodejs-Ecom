const isLogin=(req,res,next)=>{
    try {
        if(req.session.user_id){}

        else{
            res.redirect("/")
        }next();
    }catch(error){
        console.log(error.message)

    }
}

//logout

const isLogout=(req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/')

        }
        next();
    }catch(error){
        console.log(error.message)
    }
}

module.exports={isLogin,
isLogout}