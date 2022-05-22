const express = require('express');
const cors = require('cors');
require("dotenv").config();

const app = express();
const port = process.env.PROT || 5000;

// middleware
app.use(cors());
app.use(express.json())


app.get('/', (req, res) => {
  res.send('The server side is open')
});
app.listen(port, () => {
  console.log(`The manufacturer web is running ${port}`)
})