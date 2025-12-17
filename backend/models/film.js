const mongoose = require("mongoose");

const filmSchema = new mongoose.Schema({
  title: { type: String, required: true },
  watched: { type: Boolean, default: false },
  rating: { type: Number, default: null },
  image: { type: String, default: "" },
  imdbUrl: { type: String, default: "" }
});

module.exports = mongoose.model("Film", filmSchema);
