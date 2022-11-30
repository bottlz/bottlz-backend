const debug = require("debug")("bottlesDao");

const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const connString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) throw Error("Azure Storage Connection string not found");

const blobServiceClient = BlobServiceClient.fromConnectionString(connString);

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

class DrawingsDao {
  constructor(blobServiceClient, containerId) {
    this.client = blobServiceClient;
    this.containerId = containerId;

    this.container = null;
  }

  async setupContainer() {
    debug("Setting up the container...");
    this.container = blobServiceClient.getContainerClient(this.containerId);
    debug("Setting up the container...done!");
  }

  async init() {
    await this.setupContainer();
  }

  async create(name, content) {
    const { response } = await this.container.uploadBlockBlob(
      name,
      content,
      content.length
    );
    return { status: response._response.status };
  }

  async update(name, content) {
    const blobClient = this.container.getBlobClient(name);
    const leaseClient = blobClient.getBlobLeaseClient();
    leaseClient.acquireLease();
    const response = await blobClient.upload(content, content.length);
    leaseClient.releaseLease();
    return { status: response._response.status };
  }

  async get(name) {
    const blobClient = this.container.getBlobClient(name);
    const downloadBlockBlobResponse = await blobClient.download();
    const status = downloadBlockBlobResponse._response.status;
    if (status != 200) {
      return { status };
    }
    const downloaded = await streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody
    );
    return { status, drawing: downloaded };
  }
}

module.exports = DrawingsDao;
