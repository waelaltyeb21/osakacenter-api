const { default: mongoose } = require("mongoose");
const app = require("../api/index");
const corsOptions = require("./Cors");
const PORT = process.env.PORT || 5000;

app.use(corsOptions);

const EstablishConnection = async () => {
  try {
    const connect = await mongoose.connect(process.env.DB_URI, {
      dbName: "Osaka_Center_Platform",
      timeoutMS: 10000,
    });

    if (connect.connection.readyState === 1) {
      app.listen(PORT, () => {
        console.log("Server Is Running!");
      });
    }
  } catch (error) {
    console.error("Unable to connect to DB", error);
  }
};

EstablishConnection();
