const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (res.headersSent) {
      return;
    }

    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Admin access required" });
    }
  });
};

module.exports = { auth, adminAuth };
