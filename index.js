const mongoose= require("mongoose")
const mongoDB =require('./config/auth')
mongoDB.mongoDB()

const path= require('path')
const express= require('express')
const app=express();

app.set('view engine','ejs')
app.set('views','./views/users')


app.use(express.static('public/users'))
app.use(express.static(path.join(__dirname,'public')))

const userRoute=require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)


app.use((req, res, next) => {
    res.header(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next();
});

app.use((req,res)=>{
  res.status(404).render("404")
 })

app.listen(3000,()=>{console.log("successfuly connected")})