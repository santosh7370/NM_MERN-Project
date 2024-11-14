const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToDB = require("./config/connectToDB");

const app = express();

//////dotenv config (optional)/////////////////////
dotenv.config();
connectToDB();

// Set the port directly to 8001
const PORT = 8001;

//////////////////middlewares////////////////
app.use(express.json());
app.use(cors());
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong", success: false });
});

/////////routes//////////////////////
app.use('/api/user/', require('./routes/userRoutes'))
app.use('/api/admin/', require('./routes/adminRoutes'))
app.use('/api/doctor', require('./routes/doctorRoutes'))

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
