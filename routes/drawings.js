const express = require("express");
const router = express.Router();

const { drawingsDao } = require("../storageConfig");

const Drawing = require("../models/drawing");

async function createDrawing(id, content) {
  return await drawingsDao.create(
    id,
    Buffer.from(content.toString("binary"), "base64")
  );
}

async function updateDrawing(id, content) {
  return await drawingsDao.update(
    id,
    Buffer.from(content.toString("binary"), "base64")
  );
}

async function viewDrawing(id) {
  return await drawingsDao.get(id);
}

router.post("/create/:id", async function (req, res) {
  const { status } = await createDrawing(req.params.id, req.body);
  if (status == 201) {
    res.status(status).send({ id: req.params.id });
  } else {
    res
      .status(status)
      .send({ error: `drawing not created with id: ${req.params.id}` });
  }
});

router.post("/update/:id", async function (req, res) {
  const { status } = await updateDrawing(req.params.id, req.body);
  if (status == 201) {
    res.status(status).send({ id: req.params.id });
  } else {
    res
      .status(status)
      .send({ error: `drawing not created with id: ${req.params.id}` });
  }
});

router.get("/view/:id", async function (req, res) {
  const { status, drawing } = await viewDrawing(req.params.id);
  if (status == 200) {
    res.send(drawing);
  } else {
    res
      .status(status)
      .send({ error: `drawing not found with id: ${req.params.id}` });
  }
});

module.exports = router;
