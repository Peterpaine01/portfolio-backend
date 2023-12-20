// J'importe mongoose pour pouvoir faire mongoose.model
const mongoose = require("mongoose");

// MODEL PROJECT

const Project = mongoose.model("Project", {
  title: String,
  description: String,
  order: Number,
  tag: Array,
  preview: Object,
  images: Array,
  repoback: String,
  repofront: String,
  figma: String,
  url: String,
  details: {
    front: String,
    back: String,
    database: String,
    server: String,
    packages: Array,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Export du modèle
module.exports = Project;
