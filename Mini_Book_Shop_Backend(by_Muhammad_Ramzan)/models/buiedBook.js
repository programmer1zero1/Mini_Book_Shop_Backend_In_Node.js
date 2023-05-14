let mongoose = require("mongoose");

const buybookSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    bookId: {
      type: String,
      required: true,
    },
    booktitle: {
      type: String,
      required: true,
    },
    bookauthor: {
      type: String,
      required: true,
    },
    bookprice: {
      type: Number,
      required: true,
    },
    paymentStatus: String,
  },
  { timestamps: true }
);

let buybookScheme = mongoose.model("buyBooksData", buybookSchema);

module.exports = buybookScheme;
