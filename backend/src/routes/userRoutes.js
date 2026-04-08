const express = require("express");
const { updateUserRole } = require("../controllers/userController");
const { requireAuth, requireRoles } = require("../middleware/authMiddleware");
const { roleUpdateFieldRules, handleValidation } = require("../middleware/validators");

const router = express.Router();

router.patch(
  "/:id/role",
  requireAuth,
  requireRoles("Admin"),
  roleUpdateFieldRules,
  handleValidation,
  updateUserRole
);

module.exports = router;
