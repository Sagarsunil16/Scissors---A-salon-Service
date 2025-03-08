import mongoose, {Schema,Document} from 'mongoose'

export interface IMasterService extends Document {
    serviceName: string;
    serviceDescription: string;
    category: string;
    price: number;
}

const masterServiceScehma = new Schema({
    serviceName: { type: String, required: true, unique: true },
    serviceDescription: { type: String, default: "" },
    category: { type: String, enum: ["Male", "Female", "Unisex"], required: true },
    price: { type: Number, required: true },
})

export default mongoose.model("MasterService",masterServiceScehma)