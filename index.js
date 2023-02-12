const express = require("express");

const mongoose = require("mongoose");

const app = express();
const cors = require("cors");
const router = require("./Router/User");
const dotenv = require("dotenv");


dotenv.config();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.status(200).send('Welcome to my Application')
})
app.use("/api", router);

mongoose
  .connect(process.env.Mongo_url, {
    useNewUrlParser: true,
  })
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));
app.listen(PORT, () => {
  console.log("listening on port 5000");
});
