const isLogin=(req,res,next)=>{
    try {
        if(req.session.admin_id){}
        else{
            res.redirect("/admin/login")
        }next();
    }catch(error){
        console.log(error.message)

    }
}

const isLogout=(req,res,next)=>{
    try{
        if(req.session.admin_id){
            res.redirect('/admin')

        }
        next();
    }catch(error){
        console.log(error.message)
    }
}

module.exports={isLogin,
isLogout}