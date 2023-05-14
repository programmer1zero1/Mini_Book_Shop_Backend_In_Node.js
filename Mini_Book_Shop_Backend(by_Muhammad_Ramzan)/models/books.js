let mongoose = require("mongoose");

const PageSchema = new mongoose.Schema({
  pageNo: {
    type: Number,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
});

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  chapterNo: {
    type: Number,
    required: true,
  },
  pages: {
    type: [PageSchema],
    required: true,
  },
});

const bookSchema = new mongoose.Schema(
  {
    booktitle: {
      type: String,
      required: true,
    },
    bookId: {
      type: Number,
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
    bookchapters: {
      type: [ChapterSchema],
      required: true,
    },
  },
  { timestamps: true }
);

let bookScheme = mongoose.model("booksData", bookSchema);

module.exports = bookScheme;
