export function generateVerificationOtpEmailTemplate(verificationCode) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Verify Your Email - Librento</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f4f4f7;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #4f46e5;
          letter-spacing: 1px;
        }
        .title {
          font-size: 22px;
          font-weight: 600;
          margin: 10px 0;
        }
        .content {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
          text-align: center;
        }
        .otp-box {
          display: inline-block;
          padding: 12px 24px;
          background-color: #f1f5ff;
          border: 1px dashed #4f46e5;
          border-radius: 8px;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 4px;
          color: #1e3a8a;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          font-size: 13px;
          text-align: center;
          color: #888;
        }
  
        /* Responsive Styles */
        @media (max-width: 600px) {
          .container {
            padding: 20px;
            margin: 20px;
          }
          .otp-box {
            font-size: 20px;
            padding: 10px 20px;
          }
          .title {
            font-size: 20px;
          }
          .logo {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Librento</div>
          <div class="title">Your Verification Code</div>
        </div>
        <div class="content">
          Please use the code below to verify your email address:
          <div class="otp-box">${verificationCode}</div>
          This code will expire in 10 minutes.
        </div>
        <div class="footer">
          If you didn't request this, you can safely ignore this email.<br />
          &copy; Librento. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}

export function generateForgetPasswordEmailTemplate(name, resetLink) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Reset Your Password - Librento</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f4f4f7;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #4f46e5;
          letter-spacing: 1px;
        }
        .title {
          font-size: 22px;
          font-weight: 600;
          margin: 10px 0;
        }
        .content {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
          text-align: center;
        }
        .button {
          display: inline-block;
          background-color: #e0e7ff;
          color: #1e3a8a;
          padding: 12px 25px;
          border-radius: 6px;
          border: 1px solid #4f46e5;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 40px;
          font-size: 13px;
          text-align: center;
          color: #888;
        }
  
        /* Responsive Styles */
        @media (max-width: 600px) {
          .container {
            padding: 20px;
            margin: 20px;
          }
          .title {
            font-size: 20px;
          }
          .logo {
            font-size: 24px;
          }
          .button {
            font-size: 15px;
            padding: 10px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Librento</div>
          <div class="title">Reset Your Password</div>
        </div>
        <div class="content">
          Hello ${name},<br />
          We received a request to reset your password.<br />
          Click the button below to set a new one.
          <br /><br />
          <a href="${resetLink}" class="button">Reset Password</a>
          <br /><br />
          If the button doesn't work, paste this link into your browser:<br />
          <a href="${resetLink}" style="color: #4f46e5;">${resetLink}</a>
        </div>
        <div class="footer">
          If you didn't request a password reset, you can safely ignore this email.<br />
          &copy; Librento. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}
