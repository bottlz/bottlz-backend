const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { drawingsDao } = require("../storageConfig");

async function createDrawing(id, content) {
  return await drawingsDao.create(id, content);
}

async function updateDrawing(id, content) {
  return await drawingsDao.update(id, content);
}

async function getDrawing(id) {
  return await drawingsDao.get(id);
}

router.post("/create/:id", upload.single("drawing"), async function (req, res) {
  if (!req.file?.buffer) {
    return res.status(400).send({ error: "invalid drawing input" });
  }
  const { status, error } = await createDrawing(req.params.id, req.file.buffer);
  if (status == 201) {
    res.status(status).send({ id: req.params.id });
  } else {
    res.status(status).send({
      error: error ?? `drawing not created with id: ${req.params.id}`,
    });
  }
});

router.post("/update/:id", upload.single("drawing"), async function (req, res) {
  if (!req.file?.buffer) {
    return res.status(400).send({ error: "invalid drawing input" });
  }
  const { status, error } = await updateDrawing(req.params.id, req.file.buffer);
  if (status == 201) {
    res.status(status).send({ id: req.params.id });
  } else {
    res.status(status).send({
      error: error ?? `drawing not updated with id: ${req.params.id}`,
    });
  }
});

router.get("/get/:id", async function (req, res) {
  const { status, error, drawing } = await getDrawing(req.params.id);
  if (status == 200) {
    res.setHeader("content-type", "image/png");
    res.send(drawing);
  } else {
    res
      .status(status)
      .send({
        error: error ?? `could not get drawing with id: ${req.params.id}`,
      });
  }
});

module.exports = router;
