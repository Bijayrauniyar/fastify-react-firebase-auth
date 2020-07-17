/**
 * Auth
 *
 * @format
 * @middleware
 */

const User = require("../models/User");
const admin = require("firebase-admin");

module.exports = async function (req, reply, next) {
  let idToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    idToken = req.headers.authorization.split(" ")[1];
  }

  if (!idToken) {
    reply.send("idToken not found");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const user = await admin.auth().getUser(uid);

    const {
      uui,
      email,
      displayName,
      providerId,
    } = user.toJSON().providerData[0];

    const userData = {
      serviceProviderId: providerId,
      email,
      displayName: displayName,
    };

    await User.findOrCreate(userData, (err, result) => {
      if (err) {
        reply.send(err);
      }

      next();
    });

    req.user = userData;
    req.isAuthenticated = true;
  } catch (err) {
    console.log(err);
    reply.send(err);
  }
};
