import mongoose from "mongoose"

const connectDB = async ()=>{
    try {
        const connectDB = await mongoose.connect(process.env.MONGO_URI);
        console.log("mongoDB connected Successfully")
    } catch (error) {
        console.error("Error while connecting mongoDB")
    }
}

export default connectDB