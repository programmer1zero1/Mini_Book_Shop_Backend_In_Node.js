let mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", false);

//Want to use in local environment

// let mongoDB = async () => {
//   try {
//     let conn = await mongoose.connect("mongodb://127.0.0.1:27017/MiniBookShop(Muhammad_Ramzan)");
//     console.log(`MongoDB Connected Successsfully : ${conn.connection.host}`);
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };

//Want to use in online environment

let mongoDB = async()=> {
    try{
    let conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB connected Successfullly`);
    }
    catch(error){
        console.log(error)
        process.exit(1)
    }
}

module.exports = mongoDB;
