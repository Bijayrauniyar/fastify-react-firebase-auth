const fastify = require("fastify")();
const path = require("path");
const mongoose = require("mongoose");
const checkAuth = require("./middleware/checkAuth");
require("dotenv").config();
const User = require("./models/User");
const admin = require("firebase-admin");

var serviceAccount = require("./social-login-6bab5-firebase-adminsdk-k24as-4a586359a0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-login-6bab5.firebaseio.com",
});

fastify.get("/loginverify", async (req, reply) => {
  const { idToken } = req.query;

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
      // my new or existing model is loaded as result
      req.user = result;
      console.log(req.user, "resutl from req.user");
      reply.send(result);
    });
  } catch (err) {
    console.log(err);
    reply.send(err);
  }
});

//idToken comes from the client app

// get user with uid

// Client Application
const forntendAppPath = path.join(__dirname, "client/build");
fastify.register(require("fastify-static"), {
  root: forntendAppPath,
});

fastify.get("/app", async (request, reply) => {
  try {
    // reply.send("hello from app");
    reply.sendFile("index.html");
  } catch (err) {
    server.log.error('Error occured when sending Index.html for "/app"');
    server.log.error(err);
  }
});

fastify.get("/", async (request, reply) => {
  try {
    reply.redirect("/app");
  } catch (err) {
    server.log.error('Error occured when redirecting root "/" to "/app"');
    server.log.error(err);
  }
});

fastify.get("/app/*", async (request, reply) => {
  try {
    reply.sendFile("index.html");
  } catch (err) {
    server.log.error(err);
  }
});

fastify.register(require("fastify-autoload"), {
  dir: path.join(__dirname, "routes"),
  options: {
    prefix: "/",
  },
});

fastify.listen(3000, console.log);

mongoose
  .connect("mongodb://localhost:27017/passportTest", {
    useNewUrlParser: true,
  })
  .then(() =>
    console.log(
      "✅ 🗄 🗄 🗄 🗄 ✅ MongoDB Connected at: " +
        "mongodb://localhost:27017/passportTest"
    )
  )
  .catch((err) => console.log("Failed to connect to DB: \r\n", err));

// admin
// .auth()
// .verifyIdToken(idToken)
// .then(function (decodedToken) {
//   const uid = decodedToken.uid;

//   // get user data
//   admin
//     .auth()
//     .getUser(uid)
//     .then(async function (user) {
//       // See the UserRecord reference doc for the contents of userRecord.
//       //   console.log("Successfully fetched user data:", user.toJSON());
//       const {
//         uui,
//         email,
//         displayName,
//         providerId,
//       } = user.toJSON().providerData[0];

//       const userData = {
//         serviceProviderId: providerId,
//         email,
//         displayName: displayName,
//       };
//       await User.findOrCreate(userData, (err, result) => {
//         // my new or existing model is loaded as result
//         console.log(result, "resutl");
//       });
//     })
//     .catch(function (error) {
//       console.log("Error fetching user data:", error);
//     });

//   // console.log(decodedToken, "decode token");
//   // let uid = decodedToken.uid;
//   // ...
// })
// .catch(function (error) {
//   console.log(error, "error in token");

//   // Handle error
// });
