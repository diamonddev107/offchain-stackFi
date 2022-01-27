const nr = require('newrelic');
const express = require("express");
const mongoose = require('mongoose');
var cors = require('cors')
const cron = require('node-cron');
const { listenToEvents } = require("./web3/events");
const { checkIfAnyLoanHasToBeLiquidated } = require("./web3/liquidation");
const logger = require("./utils/logger")
const morgan = require('morgan');


require('dotenv').config()

let app = express();
var corsOptions = {
  origin: 'https://testnet.hashstack.finance',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

const morganMiddleware = morgan("combined", {
  stream: {
    write: (msg) => logger.http(msg)
  }
});

// apply the middleware
app.use(morganMiddleware);

const db = process.env.MONGO_URI;

if (db !== '') {
  mongoose
    .connect(
      db,
      { useNewUrlParser: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', require('./routes/index.js'));

app = listenToEvents(app);

cron.schedule('* * * * * *', async () => {
  await checkIfAnyLoanHasToBeLiquidated()
})

console.log = function(d) {
    logger.log('info','CONSOLE : %s', d)
    process.stdout.write(d + '\n');
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));