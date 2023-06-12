import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const USERNAME = process.env.DB_USERNAME;
const PASSWROD = process.env.DB_PASSWORD;

const URI = `mongodb+srv://${USERNAME}:${PASSWROD}@cluster0.5lx7gov.mongodb.net/note-manager`


const connectToMongo = async () => {
    const res = await mongoose.connect(URI);
    if(res){
        console.log("Database Connected Successfully!");
    }
    else{
        console.log("Some error occured While connecting to Database");
    }
}

export default connectToMongo;