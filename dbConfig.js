/* eslint-disable no-console */
const CosmosClient = require("@azure/cosmos").CosmosClient;
const BottlesDao = require("./models/bottlesDao");

const dotenv = require("dotenv");
dotenv.config();

const config = {};

config.host = "https://bottles-db.documents.azure.com:443/";
config.authKey = process.env.COSMOS_DB_KEY;
config.databaseId = "bottles";
config.containerId = "bottles-container1";

// set up database
const cosmosClient = new CosmosClient({
  endpoint: config.host,
  key: config.authKey,
});
const bottlesDao = new BottlesDao(
  cosmosClient,
  config.databaseId,
  config.containerId
);
bottlesDao.init();

module.exports = { bottlesDao };
