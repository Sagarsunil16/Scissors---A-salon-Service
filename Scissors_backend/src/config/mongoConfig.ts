import mongoose from "mongoose"
const mongoConnect = async():Promise<void>=>{
    try {
        await mongoose.connect(process.env.MONGO as string);
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log("Error connecting to MongoDB",error)
    }
}

export default mongoConnect