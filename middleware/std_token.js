var jwt = require('jsonwebtoken');

// const dotenv = require('dotenv');
// dotenv.config({path:'config.env'});
const JWT_SECRET = "JWT_SECRET";

const fetchstd=  (req,res,next)=>{
    const token = req.header('auth_token');
    if(!token){
        res.status(401).send({error:"Please authencticate using a valid token"})
    }
    try {
        const data= jwt.verify(token,JWT_SECRET);
        req.user = data.user;
        next()
    } catch (error) {
        res.status(401).send({error:"Please authencticate using a valid token"})
    }
    
}
module.exports = fetchstd;