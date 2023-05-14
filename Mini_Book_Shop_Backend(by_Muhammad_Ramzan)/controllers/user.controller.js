let bookScheme = require("../models/books");
let buybookScheme = require("../models/buiedBook");
const stripe = require("stripe")(process.env.STRIPE_KEY);

/**
 * Retrieves and displays the book titles and authors from the bookScheme collection.
 *
 * @function showBook
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.showBook = async (req, res) => {
  try {
    // Retrieve book titles and authors from the bookScheme collection
    let data = await bookScheme.find().select("booktitle").select("bookauthor");
    // Check if the book is found
    if (data.length > 0) {
      return res.send(data);
    } else {
      return res.json({ msg: "Data Not Found" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

/**
 * Handles the process of buying a book by creating a new checkout session and returning the session URL.
 *
 * @function buyBook
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.buyBook = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    let uid = req.user._id.toString();
    // Get the book ID from the query parameters
    let bid = req.query.bookid;
    // Check if the book ID is provided
    if (!bid) {
      return res.json({
        msg: "provide bookid in query param with name bookid",
      });
    }
    // Find the purchased book data for the user
    const finddata = await buybookScheme.findOne({
      userId: uid,
      bookId: bid,
    });
    // Chek if user buied that book before or not
    if (finddata) {
      return res.json("You Already bought That Book");
    } else {
      // Find the book data for the user
      const book = await bookScheme.findOne({ _id: bid });
      if (!book) {
        return res.json({ msg: "Invalid book ID" });
      }
      //Creating a session for the stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `BookName: ${book.booktitle}`,
                description: `Author: ${book.bookauthor}`,
              },
              unit_amount: book.bookprice * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        // Success URL
        success_url: `http://localhost:3200/user/success?bookid=${bid}&userid=${uid}`,
        // Cancel URL
        cancel_url: "http://localhost:3200/user/cancel",
      });
      // Send the session URL as the response
      const sessionUrl = session.url;
      return res.json({ sessionUrl }); // Send the session URL as the response
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};
/**
 * Handles the successful payment process by saving the purchase data and returning a success message.
 *
 * @function success
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.success = async (req, res) => {
  try {
    // Extract the book ID and user ID from the query parameter
    let { bookid, userid } = req.query;
    // Find the book by ID
    let book = await bookScheme.findOne({ _id: bookid });
    if (!book) {
      return res.json({ msg: "Invalid book ID" });
    }
    // Create a new buybookScheme instance with the purchase data
    const data = new buybookScheme({
      userId: userid,
      bookId: bookid,
      booktitle: book.booktitle,
      bookauthor: book.bookauthor,
      bookprice: book.bookprice,
      paymentStatus: "success",
    });
    // Save the purchase data
    const result = await data.save();
    if (!result) {
      return res.json({ msg: "Failed to save data" });
    }

    return res.json({ msg: "Payment successfully completed" });
  } catch (error) {
    res.json({ msg: error.message });
  }
};

/**
 * Cancels the payment process and returns a cancellation message.
 *
 * @function cancel
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.cancel = async (req, res) => {
  try {
    return res.json({ msg: "Payment cancelled" });
  } catch (error) {
    res.json({ msg: error.message });
  }
};

/**
 * Retrieves and displays a specific book if it has been purchased by the user.
 *
 * @function showSpecificBook
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.showSpecificBook = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    let uid = req.user;
    // Retrieve the book ID from the query parameter
    let id = req.query.bookid;
    // Check if the book ID is provided
    if (!id) {
      return res.json({
        msg: "provide bookid in query param with name bookid",
      });
    }
    // Find the purchased book data for the user
    let findedData = await buybookScheme.findOne({
      userId: uid._id.toString(),
      bookId: id,
    });
    // If the book has not been purchased by the user, return message
    if (!findedData) {
      return res.json({
        msg: "You Dont Buy this book Yet,please buy it first to read it",
      });
    }
    // Retrieve the book details using the book ID
    let data2 = await bookScheme.findOne({ _id: findedData.bookId });
    // If the book exists, return a success message along with the book data
    if (data2) {
      return res.json({ msg: "You Can Read This Book", data2 });
    } else {
      return res.json({
        msg: "This provided bookid Does Not Exists",
      });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

/**
 * Retrieves and displays all the books purchased by the user.
 *
 * @function myBuiedBook
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The JSON response.
 * @async
 */
exports.myBuiedBook = async (req, res) => {
  try {
    // Retrieve the user ID from the request object
    let uid = req.user;
    // Find all the books purchased by the user using the user ID
    let data = await buybookScheme
      .find({ userId: uid._id.toString() })
      .select("bookId")
      .select("bookName");
    // Check if the book is found
    if (data.length > 0) {
      return res.json({ msg: "Your All Buied Books In One Place", data });
    } else {
      return res.json({ msg: "You Dont Buy Any book Yet" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};
