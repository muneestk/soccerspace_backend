import mongoose from "mongoose";

const { Schema } = mongoose;

const connectionSchema = new Schema({
    connections: {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        manager: {
            type: Schema.Types.ObjectId,
            ref: "manager",
            required: true
        }
    }
},
{
    timestamps: true
});

const connectionModel = mongoose.model("connection", connectionSchema);
export default connectionModel;
