// J'importe mongoose pour pouvoir faire mongoose.model
const mongoose = require("mongoose");

// MODEL USER

const User = mongoose.model("User", {
  email: String,
  account: {
    username: String,
    avatar: Object,
  },
  token: String,
  hash: String,
  salt: String,
});

// Export du modèle
module.exports = User;
