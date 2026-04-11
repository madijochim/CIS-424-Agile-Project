// Stub confirmation email trigger
async function sendConfirmationEmail(email) {
  console.log(`[EMAIL] Confirmation email triggered for ${email}`);
}

// Stub password reset email
async function sendPasswordResetEmail(email, resetLink) {
  console.log("========================================");
  console.log("PASSWORD RESET EMAIL");
  console.log("Email:", email);
  console.log("Reset Link:", resetLink);
  console.log("========================================");
}

module.exports = {
  sendConfirmationEmail,
  sendPasswordResetEmail,
};