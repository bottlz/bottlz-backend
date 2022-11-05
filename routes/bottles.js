const express = require("express");
const router = express.Router();
const axios = require("axios");

const { bottlesDao } = require("../dbConfig");

const Location = require("../models/location");

const ROUTE_FUNCTION_URL =
  "https://route-function.azurewebsites.net/api/route-function";
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
  const geopoint = new Location(location).get();
  const response = await bottlesDao.addItem({
    origin: geopoint,
    endpoint: geopoint,
    routes: [],
  });
  return response;
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
  const { id } = response;
  if (id === undefined) {
    res.status(500).send({ error: `bottle not created` });
  }
  axios
    .post(ROUTE_FUNCTION_URL, response)
    .then(({ status: routesStatus }) => {
      console.log(routesStatus);
      if (routesStatus === 200) {
        res.send(response);
      } else {
        res.status(500).send({
          id,
          error: `bottle routes not initialized, status code: ${routesStatus}`,
        });
      }
      return response;
    })
    .catch(() => {
      res
        .status(500)
        .send({ id, error: `bottle routes not initialized, request error` });
    });
});

router.post("/nearby", async function (req, res) {
  const response = await getNearbyBottles(req.body.location);
  res.send(response);
});

module.exports = router;
