// @ts-check
const debug = require("debug")("todo:bottlesDao");

const mapBottle = (bottle) => {
  const { id, created, origin, endpoint, routes } = bottle ?? {};
  return {
    id,
    created,
    origin,
    endpoint,
    routes,
  };
};

class BottlesDao {
  constructor(cosmosClient, databaseId, containerId) {
    this.client = cosmosClient;
    this.databaseId = databaseId;
    this.collectionId = containerId;

    this.database = null;
    this.container = null;
  }

  async setupDatabase() {
    debug("Setting up the database...");
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId,
    });
    this.database = dbResponse.database;
    debug("Setting up the database...done!");
  }

  async setupContainer() {
    debug("Setting up the container...");
    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId,
    });
    this.container = coResponse.container;
    debug("Setting up the container...done!");
  }

  async init() {
    await this.setupDatabase();
    await this.setupContainer();
  }

  async find(querySpec) {
    debug("Querying for items from the database");
    if (!this.container) {
      throw new Error("Collection is not initialized.");
    }
    const items = await this.container.items
      .query(querySpec)
      .fetchAll()
      .then(({ resources }) => resources.map(mapBottle));
    return items ?? [];
  }

  async addItem(item) {
    debug("Adding an item to the database");
    item.created = Date.now();
    const added = await this.container.items
      .create(item)
      .then(({ resource }) => mapBottle(resource));
    return added;
  }

  async updateItem(itemId) {
    debug("Updating an item in the database");
    const doc = await this.getItem(itemId);
    const { resource: replaced } = await this.container
      .item(itemId, itemId)
      .replace(doc);
    return replaced;
  }

  async getItem(itemId) {
    debug("Getting an item from the database");
    const item = await this.container
      .item(itemId, itemId)
      .read()
      .then(({ resource }) => mapBottle(resource));
    return item;
  }

  async getAllItems() {
    debug("Getting all items from the database");
    const items = await this.container.items
      .readAll()
      .fetchAll()
      .then(({ resources }) => resources.map(mapBottle));
    return items ?? [];
  }

  async deleteAllItems() {
    debug("Deleting all items from the database");
    await this.container.delete();
    await this.setupContainer();
  }
}

module.exports = BottlesDao;
