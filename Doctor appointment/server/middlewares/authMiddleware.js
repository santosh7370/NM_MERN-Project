const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).send({
      message: "Forbidden: No token provided",
      success: false,
    });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_KEY || "default_secret_key", (err, decoded) => {
    if (err) {
      return res.status(403).send({
        message: "Forbidden: Invalid token",
        success: false,
      });
    }

    // Attach the user ID to the request object
    req.userId = decoded.id;
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authMiddleware;
