const express = require("express");
const router = express.Router();

const { bottlesDao } = require("../dbConfig");

router.get("/", async function (req, res) {
  const bottles = await bottlesDao.find({
    query: "SELECT * FROM bottles.id",
  });
  res.send(bottles);
});

router.get("/:id", async function (req, res) {
  const bottle = await bottlesDao.getItem(req.params.id);
  res.send(bottle);
});

module.exports = router;

/*
class GetBottles {
  constructor(bottlesDao) {
    this.bottlesDao = bottlesDao;
  }
  async showTasks(req, res) {
    const querySpec = {
      query: "SELECT * FROM root r WHERE r.completed=@completed",
      parameters: [
        {
          name: "@completed",
          value: false,
        },
      ],
    };

    const items = await this.taskDao.find(querySpec);
    res.render("index", {
      title: "My ToDo List ",
      tasks: items,
    });
  }

  async addTask(req, res) {
    const item = req.body;

    await this.taskDao.addItem(item);
    res.redirect("/");
  }

  async completeTask(req, res) {
    const completedTasks = Object.keys(req.body);
    const tasks = [];

    completedTasks.forEach((task) => {
      tasks.push(this.taskDao.updateItem(task));
    });

    await Promise.all(tasks);

    res.redirect("/");
  }
}
*/
