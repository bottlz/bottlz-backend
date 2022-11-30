require("dotenv").config();

const { BlobServiceClient } = require("@azure/storage-blob");
const DrawingsDao = require("./models/drawingsDao");

const config = {};

config.storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
config.containerId = "drawings";

if (!config.storageConnectionString)
  throw Error("Azure Storage Connection string not found");

// set up blob service
const blobServiceClient = BlobServiceClient.fromConnectionString(
  config.storageConnectionString
);

const drawingsDao = new DrawingsDao(blobServiceClient, config.containerId);
drawingsDao.setupContainer();
