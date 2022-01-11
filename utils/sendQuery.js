const axios = require('axios');
const queryString = require('./queryString.js')

var sendQuery = async function (option) {
    let res = await axios({
        url: `https://dbpedia.org/sparql?${queryString(option)}`,
        method: "GET",
    })
    let data = res.data.results.bindings;
    console.log(data)

    let result = {
        isValid: true,
        textRes: '',
        data: null
    }

    if (!(data && data.length)) {
        result.isValid = false;
        result.textRes = "The football player you requested could not be found";
        return result;
    } else if (data.length > 1) {
        result.isValid = false;
        result.textRes = "Please enter the full name of the football player you want to search for"
        return result;
    } else {
        result.data = data;
        return result;
    }
}
module.exports = sendQuery;

























































































































































































