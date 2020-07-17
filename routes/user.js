/**
 * Users
 * Users index route
 *
 * @format
 * @routes
 */

"use strict";

const checkAuth = require("../middleware/checkAuth");
const User = require("../models/User");

module.exports = async function (fastify, opts) {
  const routes = [
    {
      method: "GET",
      url: "/profile",
      preValidation: checkAuth,
      handler: async (req, reply) => {
        const user = await User.find({ email: req.user.email });
        reply.send(user);
      },
    },
  ];

  routes.forEach((route) => {
    fastify.route(route);
  });
};
