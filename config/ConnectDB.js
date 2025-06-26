const { default: mongoose } = require("mongoose");
const app = require("..");
const corsOptions = require("./Cors");
const PORT = process.env.PORT || 5000;

app.use(corsOptions);
const EstablishConnection = async () => {
  try {
    const connect = await mongoose.connect(process.env.DB_URI, {
      dbName: "Osaka_Center_Platform",
    });

    if (connect.connection.readyState === 1) {
      // if (process.env.NODE_ENV === "development") {
      app.listen(PORT, () => {
        console.log("Server Is Running!");
      });
      // }
      // app.listen(PORT, () => {
      //   console.log("Server Is Running!");
      // });
    }
  } catch (error) {
    console.error("Unable to connect to DB", error);
  }
};

EstablishConnection();
