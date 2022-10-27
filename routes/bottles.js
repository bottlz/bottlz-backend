const express = require("express");
const router = express.Router();

const { bottlesDao } = require("../dbConfig");

async function getBottle(id) {
  const res = await bottlesDao.getItem(id);
  return { res };
}

async function getNearbyBottles(location) {
  // TODO implement this function using geojson
  return { TODO: location };
}

async function getAllBottles() {
  const res = await bottlesDao.find({
    query: "SELECT * FROM [bottles.id, bottles.routes]",
  });
  return res;
}

async function createBottle(location) {
  // TODO replace with geojson
  const { id } = await bottlesDao.addItem({
    origin: new Location(location).dao(),
  });
  // TODO call routes function
  return { id };
}

router.get("/", async function (req, res) {
  const response = await getAllBottles();
  res.send(response);
});

router.get("/:id", async function (req, res) {
  const bottle = await getBottle(req.params.id);
  res.send(bottle);
});

router.get("/:id/view", async function (req, res) {
  // TODO view image from blob store
  const response = await getBottle(req.params.id);
  res.send(response);
});

router.post("/", async function (req, res) {
  const response = await createBottle(req.body.location);
  res.send(response);
});

router.post("/nearby", async function (req, res) {
  const response = await getNearbyBottles(req.body.location);
  res.send(response);
});

module.exports = router;
