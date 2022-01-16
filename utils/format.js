class Format {
    /**
     * 
     * @param {Date} dateOfBirth Ngày cần format
     * @returns dateString
     */
    static formatDate(date) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dateObj = new Date(date);
        const month = monthNames[dateObj.getMonth()];
        const day = String(dateObj.getDate()).padStart(2, '0');
        const year = dateObj.getFullYear();
        const output = month  + '\n'+ day  + ',' + year;
        return output;
    }

}

module.exports = Format;
























































