class SMSService {
    constructor() {
        this.provider = process.env.SMS_PROVIDER || 'mock';
    }

    /**
     * Send SMS to a phone number
     * @param {string} phone - Phone number (format: 2547XXXXXXXX)
     * @param {string} message - Message to send
     * @returns {Promise<object>} - Result object
     */
    async sendSMS(phone, message) {
        // Format phone number FIRST
        const formattedPhone = this.formatPhoneNumber(phone);

        console.log(
            `📱 [DEMO] SMS would be sent to ${formattedPhone}: ${message.substring(0, 50)}...`
        );

        // Mock service for development
        return this.sendMockSMS(formattedPhone, message);
    }

    /**
     * Format phone number to E.164 format (Kenya)
     * @param {string} phone - Raw phone number
     * @returns {string} - Formatted phone number
     */
    formatPhoneNumber(phone) {
        if (!phone) {
            throw new Error('Phone number is required');
        }

        let formatted = phone.toString().trim();

        // Remove non-digit characters
        formatted = formatted.replace(/\D/g, '');

        // Handle common Kenyan formats
        if (formatted.startsWith('0')) {
            formatted = '254' + formatted.slice(1);
        } else if (formatted.startsWith('7')) {
            formatted = '254' + formatted;
        } else if (formatted.startsWith('254')) {
            // already correct
        } else {
            throw new Error('Invalid phone number format');
        }

        return formatted;
    }

    /**
     * Mock SMS service for development
     * @param {string} phone - Phone number
     * @param {string} message - Message to send
     */
    async sendMockSMS(phone, message) {
        console.log(`📲 [MOCK SMS] To: ${phone}`);
        console.log(`   Message: ${message}`);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 100));

        return {
            success: true,
            provider: 'mock',
            messageId: `mock_${Date.now()}`,
            cost: '0.00',
            note: "This is a mock SMS. In production, this would be sent via Africa's Talking API."
        };
    }

    /**
     * Send verification code to user
     * @param {string} phone - User's phone number
     * @param {string} code - Verification code
     */
    async sendVerificationCode(phone, code) {
        const message = `Your JuaKazi verification code is: ${code}. Valid for 10 minutes.`;
        return this.sendSMS(phone, message);
    }

    /**
     * Send job alert to worker
     * @param {string} phone - Worker's phone number
     * @param {object} job - Job details
     */
    async sendJobAlert(phone, job) {
        const message =
            `📢 JOB ALERT: ${job?.title || 'New job'} in ` +
            `${job?.location?.county || 'your area'}. ` +
            `Salary: KSh ${job?.salary?.amount?.toLocaleString() || 'Negotiable'}. ` +
            `Reply YES to apply.`;

        return this.sendSMS(phone, message);
    }
}

module.exports = new SMSService();
