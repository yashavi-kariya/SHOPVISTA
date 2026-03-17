import mongoose from "mongoose";

const dbconnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.log("DB Connection Error:", error.message);
    }
};

export default dbconnect;//   username:YashaviKariya pass:shopvista0989
//mongodb+srv://YashaviKariya:shopvista0989@shopvista-cluster.sdphwhn.mongodb.net/?appName=shopvista-cluster