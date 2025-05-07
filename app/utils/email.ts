import nodemailer from 'nodemailer';

// In production, you would use real SMTP credentials
// For development, we'll use a test account
let transporter: nodemailer.Transporter;

// Initialize the transporter
export async function initializeEmailTransporter() {
  // If we're in production and have SMTP credentials
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // For development, use a test account
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('Using test email account:', testAccount.user);
  }
}

// Check if the transporter is initialized, if not initialize it
async function getTransporter() {
  if (!transporter) {
    await initializeEmailTransporter();
  }
  return transporter;
}

/**
 * Send a verification email to a user
 * 
 * @param email Recipient email address
 * @param name User's name
 * @param token Verification token
 * @returns Promise resolving to the info object from nodemailer
 */
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const transport = await getTransporter();
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify?token=${token}`;
  
  const mailOptions = {
    from: `"Twixxer" <${process.env.SMTP_FROM || 'noreply@twixxer.example.com'}>`,
    to: email,
    subject: 'Verify your Twixxer account',
    text: `Hello ${name}!\n\nPlease verify your Twixxer account by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not create a Twixxer account, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1DA1F2;">Welcome to Twixxer!</h2>
        <p>Hello ${name}!</p>
        <p>Please verify your Twixxer account by clicking the button below:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #1DA1F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #505050;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create a Twixxer account, please ignore this email.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          &copy; ${new Date().getFullYear()} Twixxer. All rights reserved.
        </div>
      </div>
    `,
  };
  
  const info = await transport.sendMail(mailOptions);
  
  // For development purposes, log the test email URL
  if (!process.env.SMTP_HOST) {
    console.log('Verification email preview URL:', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
}