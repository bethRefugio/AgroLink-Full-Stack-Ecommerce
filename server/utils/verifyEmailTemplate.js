const verifyEmailTemplate = ({name, url}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                AgroLink
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                                Verify Your Email Address
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 16px; color: #111827; font-size: 16px; line-height: 1.6;">
                                Dear <strong>${name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                Thank you for registering with <strong>AgroLink</strong>! We're excited to have you on board. To complete your registration and start exploring our platform, please verify your email address by clicking the button below.
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${url}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If the button above doesn't work, copy and paste the following link into your browser:
                            </p>
                            
                            <div style="margin: 12px 0 0; padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; word-break: break-all;">
                                <a href="${url}" style="color: #059669; text-decoration: none; font-size: 13px;">
                                    ${url}
                                </a>
                            </div>
                            
                            <p style="margin: 24px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                                <strong>Note:</strong> This verification link will expire in 24 hours for security reasons.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; line-height: 1.6;">
                                If you didn't create an account with AgroLink, please ignore this email or contact our support team.
                            </p>
                            
                            <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                                Best regards,<br>
                                <strong style="color: #6b7280;">The AgroLink Team</strong>
                            </p>
                            
                            <div style="margin: 24px 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                                    © ${new Date().getFullYear()} AgroLink. All rights reserved.
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

export default verifyEmailTemplate;