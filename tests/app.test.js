const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);

describe("sanity check", () => {
  it("/ should return 200", async () => {
    const response = await request.get("/");
    expect(response.status).toBe(200);
  });
});

describe("/bottles requests", () => {
  test.each`
    path         | method         | expected
    ${"/"}       | ${request.get} | ${404}
    ${"/get"}    | ${request.get} | ${404}
    ${"/view"}   | ${request.get} | ${404}
    ${"/create"} | ${request.get} | ${404}
    ${"/nearby"} | ${request.get} | ${404}
  `("bad paths", async ({ path, method, expected }) => {
    const response = await method(`/bottles${path}`);
    expect(response.status).toBe(expected);
  });
});
