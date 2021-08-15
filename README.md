# Coffee Lock (backend)

This is a project to manage the key holder for a coffee subscription service. 

### Run locally

Install dependencies `npm i`

Run with nodemon `nodemon server.js`

This will run on localhost:3000

### Build

Package it up and run it in AWS Elastic Beanstalk.

port tries `process.env.PORT` so this should "just work" on ELB

## Configured rules

1. the lock is assumed for 30 minutes at a time
2. the lock is not granted is after the fifth redemption of the day
3. the day is set with the first redemption of the day, else the day is the last access
4. storage is managed in a flat file in data/database.json
5. request the lock at `/redeemDrink/<username>`
