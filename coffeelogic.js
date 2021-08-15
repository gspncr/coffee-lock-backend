const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://pretNodeApp:afkjqpqXuT7a2Z6B@cluster0.dtiln.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const acquireLock = () => {
    return 'lock acquired!'
};

function requestLock(user, requestTime){
    var lockRequest = {user: user, timeOfRequest: requestTime};
    var delta = lookupLastLock(requestTime);
    console.log('delta', delta);
    if (delta <= 30){
        var delta = lockDelta(result[0].timeOfRequest)
        return {lockRequest: 'denied', user: user, time: requestTime, explanation: 'another user had a coffee within last 30 minutes'}
    } else {
        MongoClient.connect(uri, function(err, db) {
            if (err) throw err;
            var dbo = db.db("CoffeeUsers");
            dbo.collection("LockRequests").insertOne(lockRequest, function(err, res) {
                if (err) throw err;
                console.log("1 lock request inserted");
                db.close();
            });
          });
    }
    
      return {lockRequest: 'lockState', user: user, time: requestTime}
}

function lookupLastLock(requestTime){

    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("CoffeeUsers");
        var query = { 'timeOfRequest' : { '$exists' : true }, 'timeOfRequest' : {$ne: requestTime}};
        dbo.collection("LockRequests").find(query).sort({$natural:-1}).limit(2).toArray(function(err, result) {
          
          if (err) throw err;
          try{
            console.log('first', new Date(result[0].timeOfRequest).toLocaleString('en-GB', { hour12:false } ), result[0].user);
            console.log('second',new Date(result[1].timeOfRequest).toLocaleString('en-GB', { hour12:false } ), result[1].user);
            
          } catch {}
          db.close();
          return (result[0].timeOfRequest);
        });
      });
}

function lockDelta(time){
    var deltaMS = Date.now() - time;
    var deltaSeconds = parseInt(Math.floor(deltaMS / 1000), 10);
    var deltaMinutes = parseInt(Math.floor(deltaSeconds / 60), 10);
    console.log('deltas: ', deltaMS, ' ms ', deltaSeconds, ' s ', deltaMinutes, ' mins')
    return ((deltaMinutes > 30) ? True : False)
}

//exports.acquireLock = acquireLock;
module.exports = {requestLock, acquireLock};