import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true,
        min: 0,
    }
});

const City = mongoose.model('City', citySchema);
export default City;
