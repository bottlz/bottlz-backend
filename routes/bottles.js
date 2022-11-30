const express = require("express");
const router = express.Router();
const axios = require("axios");

const { bottlesDao } = require("../databaseConfig");

const Location = require("../models/location");

const ROUTE_FUNCTION_URL =
  "https://route-function.azurewebsites.net/api/route-function";
const NEARBY_KM = 3000;

async function getBottle(id) {
  const res = await bottlesDao.getItem(id);
  return res;
}

async function getNearbyBottles(location) {
  const bottles = await bottlesDao.find(`SELECT * FROM bottles b
  WHERE ST_DISTANCE(b.origin, ${JSON.stringify(location)}) < ${NEARBY_KM}`);
  return { location, bottles };
}

async function getAllBottles() {
  const bottles = await bottlesDao.getAllItems();
  return { bottles };
}

async function createBottle(location) {
  const response = await bottlesDao.addItem({
    origin: location,
    endpoint: location,
    routes: [],
  });
  return response;
}

async function deleteBottle(id) {
  await bottlesDao.deleteItem(id);
}

async function deleteAllBottles() {
  await bottlesDao.deleteAllItems();
}

router.get("/getAll", async function (req, res) {
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

router.post("/create", async function (req, res) {
  // parse location input
  let geopoint;
  try {
    geopoint = new Location(req.body.location).get();
  } catch (error) {
    return res
      .status(400)
      .send({ error: `bottle not created, ${error.message}` });
  }
  // create bottle in database
  let response;
  try {
    response = await createBottle(geopoint);
  } catch (error) {
    return res
      .status(500)
      .send({ error: `bottle not created, ${error.message}` });
  }
  const { id } = response;
  if (id === undefined) {
    return res.status(500).send({ error: `bottle not created, missing id` });
  }
  // call route function
  axios
    .post(ROUTE_FUNCTION_URL, response)
    .then(({ status: routesStatus, data }) => {
      if (routesStatus === 200) {
        return res.send(data);
      }
      deleteBottle(id);
      res.status(500).send({
        id,
        error: `bottle not created, routes function status code: ${routesStatus}`,
      });
    })
    .catch(() => {
      deleteBottle(id);
      res
        .status(500)
        .send({ id, error: `bottle not created, routes function error` });
    });
});

router.post("/nearby", async function (req, res) {
  // parse location input
  let geopoint;
  try {
    geopoint = new Location(req.body.location).get();
  } catch (error) {
    return res
      .status(400)
      .send({ error: `could not get nearby bottles, ${error.message}` });
  }
  // get nearby bottles from database
  try {
    const response = await getNearbyBottles(geopoint);
    res.send(response);
  } catch (error) {
    res
      .status(500)
      .send({ error: `could not get nearby bottles, ${error.message}` });
  }
});

router.post("/deleteAll", async function (req, res) {
  try {
    await deleteAllBottles();
    res.send();
  } catch (error) {
    res
      .status(500)
      .send({ error: `could not delete all bottles, ${error.message}` });
  }
});

module.exports = router;
