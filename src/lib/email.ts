import nodemailer from 'nodemailer';

// Configure the SMTP transport using environment variables
// It defaults to secure standard SMTP (port 465) or standard (port 587)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
    },
});

export async function sendEmail(to: string, subject: string, html: string) {
    // If SMTP is not configured, gracefully log and skip (prevents crash on dev/free tiers)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('⚠️ SMTP not configured. Skipping email sent to:', to);
        console.warn('Subject:', subject);
        return { success: false, error: 'SMTP not configured' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Concertina HR" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}
