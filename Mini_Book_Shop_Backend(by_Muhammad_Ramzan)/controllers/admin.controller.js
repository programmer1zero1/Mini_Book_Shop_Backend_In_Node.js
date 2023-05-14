let bookScheme = require("../models/books");
let registerScheme = require("../models/userRegister");
let buybookScheme = require("../models/buiedBook");
let slugify = require("slugify");

/**
 * Adds a book to the database.
 *
 * @function addBook
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */

exports.addBook = async (req, res) => {
  try {
    let { booktitle, bookId, bookauthor, bookchapters } = req.body;
    // Input validation checks...
    if (!booktitle || booktitle.length < 4) {
      return res.json({
        msg: "provide booktitle with length greater than 3 in the body",
      });
    }
    if (!bookId || bookId.length < 4) {
      return res.json({
        msg: "provide bookId with length greater than 3 in the body",
      });
    }
    if (!bookauthor || bookauthor.length < 4) {
      return res.json({
        msg: "provide bookauthor with length greater than 3 in the body",
      });
    }

    // Fetching the book price from an external source...

    let rs = await fetch(
      "http://ec2-3-82-197-46.compute-1.amazonaws.com/user/TX-Dynamics/books/rate"
    );
    let result = await rs.json();
    let price = result.data.price;
    if (!price) {
      return res.json({ msg: "There Is Error during fetching priceSS" });
    }
    // Additional input validation checks...

    if (!bookchapters) {
      return res.json({
        msg: "provide bookchapters field with type array in the body",
      });
    }
    if (!bookchapters.length > 0) {
      return res.json({
        msg: "provide objects containing different chapter in array of the field bookchapters in the body",
      });
    }
    if (!bookchapters[0].pages) {
      return res.json({
        msg: "provide pages field with type array in the body",
      });
    }
    if (!bookchapters[0].pages.length > 0) {
      return res.json({
        msg: "provide objects containing different pages in array of the field pages in the body",
      });
    }
    // Creating a new book instance...
    let data = new bookScheme({
      booktitle: slugify(req.body.booktitle, { lower: true, strict: true }),
      bookId: req.body.bookId,
      bookauthor: req.body.bookauthor,
      bookprice: price,
      bookchapters: req.body.bookchapters.map((chapter) => ({
        title: chapter.title,
        chapterNo: chapter.chapterNo,
        pages: chapter.pages.map((page) => ({
          pageNo: page.pageNo,
          body: page.body,
        })),
      })),
    });
    if (data) {
      let result = await data.save();
      return res.json({ msg: "data is created successfully", result });
    } else {
      return res.json({ msg: "Some Error happens During Creating your book" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

/**
 * Retrieves the details of a book based on the provided book ID.
 *
 * @function getupdateBook
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */

exports.getupdateBook = async (req, res) => {
  try {
    // Extract the book ID from the query parameter
    let id = req.query.bookid;
    // Check if the book ID is provided
    if (!id) {
      return res.json({
        msg: "provide bookid in query param with name bookid",
      });
    }
    // Find the book in the database based on the provided ID
    let data = await bookScheme.findOne({ _id: id });
    // Check if the book is found
    if (data) {
      return res.json({ msg: "Data find against give id is", data });
    } else {
      return res.json({ msg: "Data Not Found" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

/**
 * Updates the details of a book based on the provided book ID.
 *
 * @function updateBook
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.updateBook = async (req, res) => {
  try {
    // Extract the book ID from the query parameter
    let id = req.query.bookid;
    // Check if the book ID is provided
    if (!id) {
      return res.json({
        msg: "provide bookid in query param with name bookid",
      });
    }
    // Extract the book details from the request body
    let { booktitle, bookId, bookauthor, bookchapters, bookprice } = req.body;
    // Input validation checks...
    if (!booktitle || booktitle.length < 4) {
      return res.json({
        msg: "provide booktitle with length greater than 3 in the body",
      });
    }
    if (!bookId || bookId.length < 4) {
      return res.json({
        msg: "provide bookId with length greater than 3 in the body",
      });
    }
    if (!bookauthor || bookauthor.length < 4) {
      return res.json({
        msg: "provide bookauthor with length greater than 3 in the body",
      });
    }

    if (!bookprice || isNaN(bookprice)) {
      return res.json({
        msg: "provide bookprice in numbers in the body",
      });
    }

    if (!bookchapters) {
      return res.json({
        msg: "provide bookchapters field with type array in the body",
      });
    }
    if (!bookchapters.length > 0) {
      return res.json({
        msg: "provide objects containing different chapter in array of the field bookchapters in the body",
      });
    }
    if (!bookchapters[0].pages) {
      return res.json({
        msg: "provide pages field with type array in the body",
      });
    }
    if (!bookchapters[0].pages.length > 0) {
      return res.json({
        msg: "provide objects containing different pages in array of the field pages in the body",
      });
    }
    // Update the book in the database
    let data = await bookScheme.updateOne(
      { _id: id },
      {
        $set: {
          booktitle: booktitle,
          bookId: bookId,
          bookauthor: bookauthor,
          bookprice: bookprice,
          bookchapters: bookchapters.map((chapter) => ({
            title: chapter.title,
            chapterNo: chapter.chapterNo,
            pages: chapter.pages.map((page) => ({
              pageNo: page.pageNo,
              body: page.body,
            })),
          })),
        },
      }
    );
    // Check if the book is found and updated
    if (data) {
      return res.json({ msg: "Data find against give id is Updated", data });
    } else {
      return res.json({ msg: "Data Not Found" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

/**
 * Deletes a book based on the provided book ID.
 *
 * @function delegteBook
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.delegteBook = async (req, res) => {
  try {
    // Extract the book ID from the query parameter
    let id = req.query.bookid;
    // Check if the book ID is provided
    if (!id) {
      return res.json({
        msg: "provide bookid in query param with name bookid",
      });
    }
    // Delete the book from the database
    let data = await bookScheme.deleteOne({ _id: id });
    // Check if the book is found and deleted
    if (data) {
      return res.json({ msg: "Data find against give id is Deleted", data });
    } else {
      return res.json({ msg: "Data Not Found" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

/**
 * Generates a sales report based on the specified book ID and overall books.
 *
 * @function getsaleReport
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.getsaleReport = async (req, res) => {
  try {
    // Extract the book ID and report type from the query parameters
    let bookId = req.query.bookid;

    let totalSales = 0;

    // Retrieve sales data from the buybookScheme collection based on the book ID, if provided
    // Otherwise, retrieve all sales data
    let result;
    if (bookId) {
      result = await buybookScheme.find({ bookId: bookId });
    } else {
      result = await buybookScheme.find();
    }

    let fieldReport = [];

    // Sort the sales data by the createdAt date in ascending order
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Calculate the total sales amount by summing up the book prices
    for (let i = 0; i < result.length; i++) {
      totalSales += result[i].bookprice;
      fieldReport.push({
        date: result[i].createdAt,
      });
    }

    if (bookId) {
      return res.json({
        msg: `Total Sale of Book with ID ${bookId} in RS `,
        totalSales,
        report: [fieldReport[0].date, fieldReport[fieldReport.length - 1].date],
      });
    } else {
      return res.json({
        msg: `Total Sale of All Books in RS`,
        totalSales,
        report: [fieldReport[0].date, fieldReport[fieldReport.length - 1].date],
      });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

/**
 * Retrieves the information of all registered users.
 *
 * @function getallUsers
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.getallUsers = async (req, res) => {
  try {
    // Retrieve information of all registered users from the database
    let data = await registerScheme
      .find()
      .select("_id")
      .select("pname")
      .select("email")
      .select("isBlocked");
    // Check if any user data is found
    if (data.length > 0) {
      return res.json({ msg: "Data of All Registered users", data });
    } else {
      return res.json({ msg: "Data Not Found against this id" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

/**
 * Retrieves the information of a specific user based on the provided user ID.
 *
 * @function getuserBlocked
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.getuserBlocked = async (req, res) => {
  try {
    // Extract the user ID from the query parameter
    let id = req.query.userid;
    // Check if the user ID is provided
    if (!id) {
      return res.json({
        msg: "provide userid in query param with name userid",
      });
    }
    // Retrieve the information of the user from the database
    let data = await registerScheme
      .find({ _id: id })
      .select("_id")
      .select("pname")
      .select("email")
      .select("isVerified")
      .select("role")
      .select("isBlocked");
    // Check if any user data is found
    if (data.length > 0) {
      return res.json({ msg: "Data found against this id is", data });
    } else {
      return res.json({ msg: "Data Not Found against this id" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

/**
 * Updates the block status of a specific user based on the provided user ID.
 *
 * @function userBlocked
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.userBlocked = async (req, res) => {
  try {
    // Extract the user ID and block status from the query parameters
    let id = req.query.userid;
    let blockid = req.query.isblocked;
    // Check if the user ID is provided

    if (!id) {
      return res.json({
        msg: "provide userid in query param with name userid",
      });
    }
    // Check if the block status is provided
    if (!blockid) {
      return res.json({
        msg: "provide isblocked as true or false in query param with name isblocked",
      });
    }
    // Update the block status of the user in the database
    let data = await registerScheme.updateOne(
      { _id: id },
      {
        $set: {
          isBlocked: blockid,
        },
      }
    );
    // Check if the update operation was successful
    if (data) {
      return res.json({ msg: "User Status Updated Successfully", data });
    } else {
      return res.json({
        msg: "Data Could Not found or User Status can't Be Updated",
      });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};
