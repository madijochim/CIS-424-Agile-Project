const { body, validationResult } = require("express-validator");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed.",
      fields: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  return next();
}

const registerFieldRules = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").trim().isEmail().withMessage("Please enter a valid email address."),
  body("password").isLength({ min: 1 }).withMessage("Password is required."),
];

const loginFieldRules = [
  body("email").trim().isEmail().withMessage("Please enter a valid email address."),
  body("password").isLength({ min: 1 }).withMessage("Password is required."),
];

const roleUpdateFieldRules = [
  body("role")
    .trim()
    .isIn(["Admin", "Manager", "Viewer"])
    .withMessage("Role must be Admin, Manager, or Viewer."),
];

module.exports = {
  registerFieldRules,
  loginFieldRules,
  roleUpdateFieldRules,
  handleValidation,
};
