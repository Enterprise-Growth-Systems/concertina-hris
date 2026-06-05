export async function sendEmail(to: string, subject: string, html: string) {
    const url = process.env.GOOGLE_SCRIPT_URL;

    // If Google Script URL is not configured, gracefully log and skip (prevents crash on dev/free tiers)
    if (!url) {
        console.warn('⚠️ GOOGLE_SCRIPT_URL not configured. Skipping email sent to:', to);
        console.warn('Subject:', subject);
        return { success: false, error: 'Google Script URL not configured' };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html }),
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || "Google Script returned an error");
        }

        console.log("Email successfully sent via Google Apps Script to:", to);
        return { success: true };
    } catch (error) {
        console.error('Failed to send email via Google Apps Script:', error);
        return { success: false, error };
    }
}
