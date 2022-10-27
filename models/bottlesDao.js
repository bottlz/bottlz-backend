// @ts-check
const debug = require("debug")("todo:bottlesDao");

class BottlesDao {
  constructor(cosmosClient, databaseId, containerId) {
    this.client = cosmosClient;
    this.databaseId = databaseId;
    this.collectionId = containerId;

    this.database = null;
    this.container = null;
  }

  async init() {
    debug("Setting up the database...");
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId,
    });
    this.database = dbResponse.database;
    debug("Setting up the database...done!");
    debug("Setting up the container...");
    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId,
    });
    this.container = coResponse.container;
    debug("Setting up the container...done!");
  }

  async find(querySpec) {
    debug("Querying for items from the database");
    if (!this.container) {
      throw new Error("Collection is not initialized.");
    }
    const { resources } = await this.container.items
      .query(querySpec)
      .fetchAll();
    return resources;
  }

  async addItem(item) {
    debug("Adding an item to the database");
    item.created = Date.now();
    const {
      resource: { id, origin, routes },
    } = await this.container.items.create(item);
    return { id, origin, routes };
  }

  async updateItem(itemId) {
    debug("Updating an item in the database");
    const doc = await this.getItem(itemId);
    doc.completed = true;

    const { resource: replaced } = await this.container
      .item(itemId, itemId)
      .replace(doc);
    return replaced;
  }

  async getItem(itemId) {
    debug("Getting an item from the database");
    const {
      resource: { origin, routes },
    } = await this.container.item(itemId, itemId).read();

    return { origin, routes };
  }
}

module.exports = BottlesDao;
