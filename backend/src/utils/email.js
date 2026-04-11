// Stub confirmation email trigger
async function sendConfirmationEmail(email) {
  console.log(`[EMAIL] Confirmation email triggered for ${email}`);
}

// Sending the password reset email
async function sendPasswordResetEmail(email, resetLink) {
  console.log(`[EMAIL] Password reset for ${email}`);
  console.log(`[EMAIL] Reset link: ${resetLink}`);
}


module.exports = {
  sendConfirmationEmail,
  sendPasswordResetEmail,
};