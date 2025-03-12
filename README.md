# API - LOGIN DEMO
This repositary contains basic code for demonstrational purposes. It contains some routes that require authentication, and some that require authorization. 
It requires access to a mongo database, but should be easy enought to reconfigure for other dbs.

## Apropos .env
- DBURI will connect to a mongodb instance at this location or fail at startup.
- DBNAME should have a value so you can identify what database is being used by this app
- REDISURI the app will connect to redis at this URI or fail if no URI is provided

## Apropos redis
This app uses redis to handle banned accesstokens and is configured to connect to redis locally on the host machine. Should 
you need access redis anywhere else, be sure modify "./handlers/redishandler.js" and "./apiserver.js"

## Encryption
This app uses a private/public keypair to enhance security, so you must deploy a keypair named exactly
- jwt-private.pem
- jwt-public.pem