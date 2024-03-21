const mongoose=require('mongoose');
const connectDB = async()=>{
    try{
        const con = await mongoose.connect("mongodb+srv://maneeshmondal56:maneesh1120@cluster0.hzfxtms.mongodb.net/",{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        })
        console.log('MongoDB connected');
    }catch(error){
        console.log(error);
        process.exit(1);
    }
}
module.exports=connectDB;