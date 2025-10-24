const request = require("supertest");
const { expect } = require("chai");
const app = require("../index");

describe("GET /", () => {
  it("should return status ok and env", async () => {
    const res = await request(app).get("/");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("status", "ok");
    expect(res.body).to.have.property("env");
  });
});
