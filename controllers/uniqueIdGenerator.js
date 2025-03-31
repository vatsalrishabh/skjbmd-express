const User = require('../models/User');

/**
 * @desc    Generate a unique ID for the user, including milliseconds
 * @returns {Promise<string>} Unique ID in format DDMMYYHHMMSSSSS
 */
const generateUniqueId = async () => {
    const generateId = () => {
        const now = new Date();

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = String(now.getFullYear()).slice(-2); // Last two digits of the year
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        return `${day}${month}${year}${hours}${minutes}${seconds}${milliseconds}`;
    };

    let uniqueId;
    let exists = true;

    // Regenerate the ID if it already exists in the database
    while (exists) {
        uniqueId = generateId();
        exists = await User.findOne({ userId: uniqueId });
    }

    return uniqueId;
};

module.exports = { generateUniqueId };
