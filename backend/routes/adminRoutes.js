const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const adminController = require("../controllers/adminController");

router.use(protect);
router.use(allowRoles("admin"));

router.get("/users", adminController.getAllUsers);
router.get("/batch-status", adminController.getBatchStatus);

module.exports = router;
