const express = require("express");
const router = express.Router();

const { bottlesDao } = require("../dbConfig");

const Location = require("../models/location");

const NEARBY_KM = 3000;

async function getBottle(id) {
  const res = await bottlesDao.getItem(id);
  return res;
}

async function getNearbyBottles(location) {
  const userLocation = new Location(location).get();
  const bottles = await bottlesDao.find(`SELECT * FROM bottles b
  WHERE ST_DISTANCE(b.origin, ${JSON.stringify(userLocation)}) < ${NEARBY_KM}`);
  return { location: userLocation, bottles };
}

async function getAllBottles() {
  const bottles = await bottlesDao.getAllItems();
  return { bottles };
}

async function createBottle(location) {
  const { id } = await bottlesDao.addItem({
    origin: new Location(location).get(),
  });
  // TODO call routes function
  return { id };
}

router.get("/all", async function (req, res) {
  const response = await getAllBottles();
  res.send(response);
});

router.get("/get/:id", async function (req, res) {
  const response = await getBottle(req.params.id);
  if (response.id) {
    res.send(response);
  } else {
    res
      .status(404)
      .send({ error: `bottle not found with id: ${req.params.id}` });
  }
});

router.get("/view/:id", async function (req, res) {
  // TODO view image from blob store
  const response = await getBottle(req.params.id);
  if (response.id) {
    res.send(response);
  } else {
    res
      .status(404)
      .send({ error: `bottle not found with id: ${req.params.id}` });
  }
});

router.post("/create", async function (req, res) {
  const response = await createBottle(req.body.location);
  if (response.id) {
    res.status(202).send(response);
  } else {
    res.status(500).send({ error: `bottle not created` });
  }
});

router.post("/nearby", async function (req, res) {
  const response = await getNearbyBottles(req.body.location);
  res.send(response);
});

module.exports = router;
