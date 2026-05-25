const mongoose = require("mongoose");
 
mongoose
    .connect(process.env.MONGO_URI, { dbName: "technest" })
    .then(() => console.log("MongoDB connected — technest"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
 