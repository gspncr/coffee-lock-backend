const JSONdb = require('simple-json-db');
const db = new JSONdb('./data/database.json');

function oneTimeDB(){
    console.log('DB was not detected, creating sample entry...')
    db.set('user', 'gary');
    db.set('timeOfRequest', 1628604436);
    db.set('redemptionCount', 0);
    db.set('todayISO', '2021-08-09')
    console.log(db.JSON());
    db.get('timeOfRequest')
}

function viewLock(){
    var lastLock = lookupLastLock(new Date());
    var delta = lockDelta(lastLock)
    if (delta <= 30 || fetchRedemptions() == 5){
        return {
            countdownToCoffee: timeToCoffee(delta), lastLockedBy: lastCaffinatedUser(),
            coffeesRedeemedToday: fetchRedemptions(), asOf: getLastKnownISO(), timeOfUnlock: timeToUnlock(),
            timestampOfUnlock: epochToUnlock(),
        }
    } else {
        return {
            countdownToCoffee: 'coffee is available!', lastLockedBy: lastCaffinatedUser(), 
            coffeesRedeemedToday: fetchRedemptions(), asOf: getLastKnownISO(), timeOfUnlock: timeToUnlock(),
            timestampOfUnlock: epochToUnlock(),
            explanation: 'this does not reserve your coffee! Go to /redeemDrink/<name> for that'
        }
    }   
}

function requestLock(user, requestTime){
    var lastLock = lookupLastLock(requestTime);
    var delta = lockDelta(lastLock);
    checkDatesMatch(user);
    //console.log('delta', delta);
    if (delta <= 30){
        //deny lock request
        return {
            lockRequest: 'denied', yourUser: user, time: requestTime, 
            countdownToCoffee: timeToCoffee(delta), lastLockedBy: lastCaffinatedUser(),
            coffeesRedeemedToday: fetchRedemptions(), timeOfUnlock: timeToUnlock(),
            timestampOfUnlock: epochToUnlock(),
            explanation: 'another user had a coffee within last 30 minutes or > 5 drinks redeemed'
        }
    } else if (fetchRedemptions() == 5){
        return {
            lockRequest: 'denied', yourUser: user, time: requestTime, 
            countdownToCoffee: timeToCoffee(delta), lastLockedBy: lastCaffinatedUser(),
            coffeesRedeemedToday: fetchRedemptions(), timeOfUnlock: timeToUnlock(),
            timestampOfUnlock: epochToUnlock(),
            explanation: '>= 5 drinks redeemed'
        }
    }else {
        unlock()
        db.set('user', user);
        db.set('timeOfRequest', requestTime)
        return {lockRequest: 'granted', user: user, time: requestTime, coffeesRedeemedToday: checkRedemptions(user)}
    }
    
    //return a granted or denied lock request
    return {lockRequest: 'unknown', user: user, time: requestTime}
}

function lookupLastLock(requestTime){
    //query for the last granted lock. Stretch: who has or had the lock last?
    var lastLocked = db.get('timeOfRequest');
    return lastLocked
}

function epochToUnlock(){
    var lastLocked = db.get('timeOfRequest');
    var stampToUnlock = lastLocked + 1800000;
    return stampToUnlock
}

function lockDelta(time){
    var deltaMS = Date.now() - time;
    var deltaSeconds = parseInt(Math.floor(deltaMS / 1000), 10);
    var deltaMinutes = parseInt(Math.floor(deltaSeconds / 60), 10);
    //console.log('deltas: ', deltaMS, ' ms ', deltaSeconds, ' s ', deltaMinutes, ' mins')
    return deltaMinutes
}

function timeToCoffee(delta){
    //return the time until another coffee can be redeemed
    return 30 - delta + ' minutes'
}

function checkDatesMatch(user){
    if(user){
        let lastStoredDay = db.get('todayISO')
        let today = new Date().toISOString().slice(0, 10)
        if (lastStoredDay != today){
            db.set('todayISO', today)
            console.log('setting a new day')
            db.set('redemptionCount', 0);
            return fetchRedemptions();
        } else if(lastStoredDay === today){
            console.log('dates match')
        }
    }
}

function checkRedemptions(user){
    //perform checks of 5 redemptions per day
    let lastStoredDay = db.get('todayISO')
    let today = new Date().toISOString().slice(0, 10)

    //if redemptions are at five then return back
    if(fetchRedemptions() >=5 && lastStoredDay === today){
        console.log('all drinks used!');
        return "All drinks consumed!"
    }

    if(lastStoredDay === today && user){
        console.log('todays the day and you are user ', user)
        incrementRedemptions()
        return fetchRedemptions();

    } else if (lastStoredDay === today){
        console.log('todays the day')
        return fetchRedemptions();

    } else{
        db.set('todayISO', today)
        console.log('setting a new day')
        db.set('redemptionCount', 0);
        return fetchRedemptions();
    }
}

function getLastKnownISO(){
    //in the "view" mode, display info with date context (if im in view and it is first redemption OTD)
    lastKnown = db.get('todayISO');
    return lastKnown
}

function timeLastLocked(){
    lastLock = db.get('timeOfRequest');
    return lastLock;
}

function fetchRedemptions(){
    //return the count of redemptions only
    let redemptions = db.get('redemptionCount');
    return redemptions
}

function incrementRedemptions(){
    //increment redemptions
    let redemptions = fetchRedemptions()+1;
    db.set('redemptionCount',redemptions);
    return fetchRedemptions();
}

function unlock(){
    //remove the current lock
    db.delete('user');
    db.delete('timeOfRequest')
    return 'done'
}

function lastCaffinatedUser(){
    //who last redeemed
    lastUser = db.get('user')
    return lastUser
}

function timeToUnlock(){
    //timestamp until no longer locked
    lastLock = lookupLastLock();
    timestampToUnlock = lastLock + 1800000;
    unlockingTime = new Date(timestampToUnlock).toLocaleString('en-GB', { timeZone: 'Europe/London'})
    //console.log(new Date(unlockingTime).getTimezoneOffset());
    return unlockingTime
}

//if there is no user in the DB then instantiate a new DB
db.has('user') ? console.log('DB found') : oneTimeDB()

module.exports = {requestLock, viewLock};