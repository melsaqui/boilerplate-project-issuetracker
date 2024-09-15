// Do not change this file
require('dotenv').config();
const { MongoClient } = require('mongodb');
const mongoose = require("mongoose");

async function main(callback) {
    const URI = process.env.MONGO_URI; // Declare MONGO_URI in your .env file
    const client = new MongoClient(URI);

    try {
        // Connect to the MongoDB cluster
         client.connect();

        // Make the appropriate DB calls
         callback(client);

    } catch (e) {
        // Catch any errors
        console.error(e);
        throw new Error('Unable to Connect to Database')
    }

}

module.exports = main;