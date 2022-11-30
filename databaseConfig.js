/* eslint-disable no-console */
require("dotenv").config();

const CosmosClient = require("@azure/cosmos").CosmosClient;
const BottlesDao = require("./models/bottlesDao");

const config = {};

config.dbHost = "https://bottles-db.documents.azure.com:443/";
config.dbKey = process.env.COSMOS_DB_KEY;
config.databaseId = "bottles";
config.containerId = "bottles-container1";

if (!config.dbKey) throw Error("Azure Cosmos DB key not found");

// set up database
const cosmosClient = new CosmosClient({
  endpoint: config.dbHost,
  key: config.dbKey,
});
const bottlesDao = new BottlesDao(
  cosmosClient,
  config.databaseId,
  config.containerId
);
bottlesDao.init();

module.exports = { bottlesDao };
