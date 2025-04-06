const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAILER_MAIL,
    pass: process.env.MAILER_SECRET,
  },
});

/**
 * Send email to the specified recipients
 * @param {string[]} recipients - Array of email addresses
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 * @returns {Promise} - Promise resolving to send info
 */
const sendEmail = async (recipients, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"${process.env.MAILER_NAME}" <${process.env.MAILER_MAIL}>`,
      to: recipients.join(', '),
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send emergency notification to guardians
 * @param {Object} user - User object
 * @param {Object} emergency - Emergency object
 * @returns {Promise} - Promise resolving to send info
 */
const sendEmergencyNotification = async (user, emergency) => {
  if (!user || !user.guardian_emails || user.guardian_emails.length === 0) {
    console.log('No guardian emails to notify');
    return null;
  }

  const mapLink = `https://www.google.com/maps?q=${emergency.latlon.coordinates[1]},${emergency.latlon.coordinates[0]}`;
  
  const subject = `EMERGENCY ALERT: ${user.name} needs help!`;
  
  const text = `
    EMERGENCY ALERT
    
    ${user.name} has triggered an emergency request at ${new Date(emergency.created_at).toLocaleString()}.
    
    User Details:
    Name: ${user.name}
    Phone: ${user.mobile}
    Location: ${user.location.city}, ${user.location.district}, ${user.location.state}
    
    Emergency Location: ${mapLink}
    
    Please contact them immediately or reach out to local authorities if you can't reach them.
    
    This is an automated message. Please do not reply to this email.
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #d9534f; text-align: center;">⚠️ EMERGENCY ALERT ⚠️</h1>
      
      <p style="font-size: 16px;"><strong>${user.name}</strong> has triggered an emergency request at ${new Date(emergency.created_at).toLocaleString()}.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin-top: 0;">User Details:</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Phone:</strong> ${user.mobile}</p>
        <p><strong>Location:</strong> ${user.location.city}, ${user.location.district}, ${user.location.state}</p>
      </div>
      
      <p><strong>Emergency Location:</strong> <a href="${mapLink}" target="_blank" style="color: #0275d8;">View on Google Maps</a></p>
      
      <div style="background-color: #d9534f; color: white; padding: 10px; text-align: center; margin: 20px 0; border-radius: 4px;">
        Please contact them immediately or reach out to local authorities if you can't reach them.
      </div>
      
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message. Please do not reply to this email.</p>
    </div>
  `;
  
  return await sendEmail(user.guardian_emails, subject, text, html);
};

module.exports = {
  sendEmail,
  sendEmergencyNotification
};
