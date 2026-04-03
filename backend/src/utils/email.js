// Stub confirmation email trigger
async function sendConfirmationEmail(email) {
  console.log(`[EMAIL] Confirmation email triggered for ${email}`);
}

module.exports = {
  sendConfirmationEmail,
};