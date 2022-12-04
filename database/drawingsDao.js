const debug = require("debug")("bottlesDao");

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
    this.blobServiceClient = blobServiceClient;
    this.containerId = containerId;

    this.container = null;
  }

  async setupContainer() {
    debug("Setting up the container...");
    this.container = this.blobServiceClient.getContainerClient(
      this.containerId
    );
    debug("Setting up the container...done!");
  }

  async init() {
    await this.setupContainer();
  }

  async create(name, content) {
    const exists = await this.container.getBlockBlobClient(name).exists();
    if (exists) {
      return { status: 400, error: `blob with name ${name} already exists` };
    }
    const { response } = await this.container.uploadBlockBlob(
      name,
      content,
      content.length
    );
    return { status: response._response.status };
  }

  async update(name, content) {
    const blobClient = this.container.getBlockBlobClient(name);
    const leaseClient = blobClient.getBlobLeaseClient();
    const { leaseId } = await leaseClient.acquireLease(15);
    const options = {
      conditions: { leaseId },
    };
    const response = await blobClient.upload(content, content.length, options);
    // const blockId = Buffer.from("drawing").toString("base64");
    // const stageResponse = await blobClient.stageBlock(
    //   blockId,
    //   content,
    //   content.length,
    //   options
    // );
    // if (stageResponse._response.status != 201) {
    //   return {
    //     status: stageResponse._response.status,
    //     error: "could not stage block",
    //   };
    // }
    // const response = await blobClient.commitBlockList([blockId], options);
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
