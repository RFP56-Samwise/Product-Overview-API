const newrelic = require('newrelic')
const fs = require('fs')
const csv = require('csv-parser');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const db = require('./db.js');
const app = express();

const productRoute = require('./routes/products')
const cartRoute = require('./routes/cart')

const PORT = 3010;

app.use(cors())
app.use(bodyParser.json());

app.use('/api/products', productRoute);
app.use('/api/cart', cartRoute);


app.listen(PORT, () => {
  console.log(`Currenty listening to PORT ${PORT}`)
})

module.exports = { app }
