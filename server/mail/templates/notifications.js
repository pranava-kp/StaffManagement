const sender = require("../sender");

module.exports = {
    /**
     * Send system notification email
     * @param {string} email - Recipient address
     * @param {string} message - Notification content
     * @param {string} type - Notification type (e.g., "alert", "info")
     */
    sendNotification: async (email, message, type = "info") => {
        const title = `System Notification: ${type.toUpperCase()}`;
        const body = `
            <div style="font-family: Arial, sans-serif;">
                <h3 style="color: ${type === 'alert' ? '#dc2626' : '#2563eb'};">
                    ${title}
                </h3>
                <p>${message}</p>
            </div>
        `;
        return sender(email, title, body);
    }
};