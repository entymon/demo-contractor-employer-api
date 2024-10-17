const cors = require('cors');
const express = require('express');
const { errorHandler } = require('./error.middleware.js')
const { getProfile } = require('./getProfile.middleware')

const middleware = (app) => {
  app.use(errorHandler);
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  app.use(getProfile);
  app.use(router);
  app.use("*", (req, res) => {
    res.status(404).send("Route not found");
  });
};

module.exports = {middleware}