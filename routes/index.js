var express = require('express');
var router = express.Router();
const axios = require('axios');
const Format = require('../utils/format.js')
const sendQuery = require('../utils/sendQuery.js')

const wiki = require('wikijs').default;

const newEngine = require('@comunica/actor-init-sparql').newEngine;

const myEngine = newEngine();


let option = {
    "default-graph-uri": "http://dbpedia.org",
    "format": "application/sparql-results+json",
    "query": 'SELECT ?x ?height WHERE {?x <http://dbpedia.org/property/name> ?name. ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Person>. ?x <http://dbpedia.org/ontology/birthPlace> ?height. FILTER regex(?name, "Công Phượng", "i")}',
    "signal_unconnected": "on",
    "signal_void": "on",
    "timeout": "30000"
}

/* GET home page. */
router.post('/chatbot', function (req, res, next) {
    (async () => {
        // console.log(`https://dbpedia.org/sparql?${queryString(option)}`)
        // axios({
        //     url: `https://dbpedia.org/sparql?${queryString(option)}`,
        //     method: "GET",
        // })
        // .then((res) => {
        //     console.log('res: ', res.data.results.bindings)
        // })
        // .catch((error) => {
        //     console.log(error)
        // });

        if (!(req.body && req.body.queryResult && req.body.queryResult.parameters)) {
            return res.json({
                fulfillmentText: "fulfillmentText",
                fulfillmentMessages: [{
                    "text": {
                        "text": ["Sorry, what was that?"]
                    }
                }],
                source: "webhook-sample"
            });
        }

        let parameters = req.body.queryResult.parameters;
        let person = parameters.person;
        let action = req.body.queryResult.action;
        if (!(person && action)) {
            return res.json({
                fulfillmentText: "fulfillmentText",
                fulfillmentMessages: [{
                    "text": {
                        "text": ["I didn't get that. Can you say it again?"]
                    }
                }],
                source: "webhook-sample"
            });
        }

        /**
         * Query Dbpedia
         */
        let textRes = '';        
        if (action === 'ask_summary') {
            option.query = `SELECT ?x ?abstract WHERE {?x <http://dbpedia.org/property/name> ?name. ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/SoccerPlayer>. ?x <http://dbpedia.org/ontology/abstract> ?abstract. FILTER(regex(?name, "${person.name}", "i") && lang(?abstract)="en")}`;

            let result = await sendQuery(option);

            if (result.isValid) {
                textRes = result.data[0].abstract.value;
            } else {
                textRes = result.textRes;
            }
        }
        else if (action === 'ask_height') {
            option.query = `SELECT ?x ?height WHERE {?x <http://dbpedia.org/property/name> ?name. ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/SoccerPlayer>. ?x <http://dbpedia.org/ontology/height> ?height. FILTER(regex(?name, "${person.name}", "i"))}`;

            let result = await sendQuery(option);

            if (result.isValid) {
                let height = result.data[0].height.value;
                textRes = `${person.name}'s height is ${height}m`;
            } else {
                textRes = result.textRes;
            }
        }
        else if (action === 'ask_age') {
            option.query = `SELECT ?x ?birthDate WHERE {?x <http://dbpedia.org/property/name> ?name. ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/SoccerPlayer>. ?x <http://dbpedia.org/ontology/birthDate> ?birthDate. FILTER(regex(?name, "${person.name}", "i"))}`;

            let result = await sendQuery(option);

            if (result.isValid) {
                let birthday = result.data[0].birthDate.value;
                let ageDifMs = Date.now() - new Date(birthday).getTime();
                let ageDate = new Date(ageDifMs); // miliseconds from epoch
                let age = Math.abs(ageDate.getUTCFullYear() - 1970);

                textRes = `${person.name} is ${age} years old`;
            } else {
                textRes = result.textRes;
            }
        }
        else if (action === 'ask_birthday') {
            option.query = `SELECT ?x ?birthDate WHERE {?x <http://dbpedia.org/property/name> ?name. ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/SoccerPlayer>. ?x <http://dbpedia.org/ontology/birthDate> ?birthDate. FILTER(regex(?name, "${person.name}", "i"))}`;

            let result = await sendQuery(option);

            if (result.isValid) {
                let birthday = result.data[0].birthDate.value;
                textRes = `${person.name}'s birthday is  ${Format.formatDate(birthday)}`;
            } else {
                textRes = result.textRes;
            }
        }
        // else if (action === 'ask_birthplace') {
        //     if (!(pageInfo && pageInfo.general && pageInfo.general.birthPlace)) {
        //         textRes = "I didn't get that. Can you repeat?"
        //     }
        //     else {
        //         let birthPlace = pageInfo.general.birthPlace;
        //         textRes = `${person.name} was born in  ${birthPlace}`;
        //     }
        // }
        // else if (action === 'ask_currentteam') {
        //     if (!(pageInfo && pageInfo.general && pageInfo.general.currentclub)) {
        //         textRes = "I didn't get that. Can you repeat?"
        //     }
        //     else {
        //         let currentclub = pageInfo.general.currentclub;
        //         textRes = `${person.name} is playing for ${currentclub}`;
        //     }
        // }
        else if (action === 'ask_fullname') {
            option.query = `SELECT ?x ?fullname WHERE {?x <http://dbpedia.org/property/name> ?name. ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/SoccerPlayer>. ?x <http://dbpedia.org/property/fullname> ?fullname. FILTER(regex(?name, "${person.name}", "i"))}`;

            let result = await sendQuery(option);

            if (result.isValid) {
                let fullname = result.data[0].fullname.value;
                textRes = `${person.name}'s full name is ${fullname}`;
            } else {
                textRes = result.textRes;
            }
        }
        else if (action === 'ask_number') {
            option.query = `SELECT ?x ?number WHERE {?x <http://dbpedia.org/property/name> ?name. ?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/SoccerPlayer>. ?x <http://dbpedia.org/ontology/number> ?number. FILTER(regex(?name, "${person.name}", "i"))}`;

            let result = await sendQuery(option);

            if (result.isValid) {
                let number = result.data[0].number.value;
                textRes = `${person.name}'s club number is ${number}`;
            } else {
                textRes = result.textRes;
            }
        }
        // else if (action === 'ask_position') {
        //     if (!(pageInfo && pageInfo.general && pageInfo.general.position)) {
        //         textRes = "I didn't get that. Can you repeat?"
        //     }
        //     else {
        //         let position = pageInfo.general.position;
        //         textRes = `${person.name} plays the position of  ${position.constructor === Array ? position.join(', ') : position}`;
        //     }
        // }
        else {
            textRes = "I didn't get that. Can you repeat?"
        }

        return res.json({
            fulfillmentText: "fulfillmentText",
            fulfillmentMessages: [{
                "text": {
                    "text": [textRes]
                }
            }],
            source: "webhook-sample"
        });

    })();

});

module.exports = router;                                                     
