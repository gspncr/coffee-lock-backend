const express = require('express')
const coffeeLogic = require('./coffeeDB')
const cors = require('cors')
const app = express()


app.use(cors())

app.get( '/health', (req, res, next) => {
  res.send( "healthy" );
});

app.all('/', (req, res) => {
    res.type('application/json');
    res.send(coffeeLogic.viewLock())
})

app.all('/redeemDrink/:user', (req, res) => {
    var didItLock = coffeeLogic.requestLock(req.params.user, Date.now());
    console.log(didItLock);
    res.type('application/json');
    res.send(didItLock)
})

const port = process.env.PORT || 3000;
const server = app.listen(port, function() {
  console.log("Server running at http://127.0.0.1:" + port + "/");
});