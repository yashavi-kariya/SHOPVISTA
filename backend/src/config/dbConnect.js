import mongoose from "mongoose";

const dbconnect = async () => {
    try {
        // Change MONGO_URL to MONGO_URI to match your Render dashboard
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.log("DB Connection Error:", error.message);
    }
};

export default dbconnect;//   username:YashaviKariya pass:shopvista0989
//mongodb+srv://YashaviKariya:shopvista0989@shopvista-cluster.sdphwhn.mongodb.net/?appName=shopvista-cluster