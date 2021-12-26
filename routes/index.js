var express = require('express');
var router = express.Router();
const axios = require('axios');
const Format = require('../utils/format.js')

const wiki = require('wikijs').default;

/* GET home page. */
router.post('/chatbot', function (req, res, next) {
    (async () => {
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

        let page;
        try {
            page = await wiki().page(person.name);
        } catch (error) {
            console.log(error)
        }
        
        if (!page) {
            return res.json({
                fulfillmentText: "fulfillmentText",
                fulfillmentMessages: [{
                    "text": {
                        "text": ["I missed that, say that again?"]
                    }
                }],
                source: "webhook-sample"
            });
        }

        let pageInfo = await page.fullInfo();
        let textRes = '';
        console.log('pageInfo: ', pageInfo);
        
        if (action === 'ask_summary') {
            let pageSummary = await page.summary();

            if (pageSummary) {
                textRes = pageSummary;
            } else {
                textRes = "I didn't get that. Can you repeat?"
            }
        }
        else if (action === 'ask_age') {
            if (!(pageInfo && pageInfo.general && pageInfo.general.birthDate && pageInfo.general.birthDate.age)) {
                textRes = "I didn't get that. Can you repeat?"
            }

            let age = pageInfo.general.birthDate.age;
            textRes = `${person.name} is ${age} years old`;
        }
        else if (action === 'ask_birthday') {
            if (!(pageInfo && pageInfo.general && pageInfo.general.birthDate && pageInfo.general.birthDate.date)) {
                textRes = "I didn't get that. Can you repeat?"
            }

            let birthday = pageInfo.general.birthDate.date;
            textRes = `${person.name}'s birthday is  ${Format.formatDate(birthday)}`;
        }
        else if (action === 'ask_birthplace') {
            if (!(pageInfo && pageInfo.general && pageInfo.general.birthPlace)) {
                textRes = "I didn't get that. Can you repeat?"
            }

            let birthPlace = pageInfo.general.birthPlace;
            textRes = `${person.name} was born in  ${birthPlace}`;
        }
        else if (action === 'ask_currentteam') {
            if (!(pageInfo && pageInfo.general && pageInfo.general.currentclub)) {
                textRes = "I didn't get that. Can you repeat?"
            }

            let currentclub = pageInfo.general.currentclub;
            textRes = `${person.name} is playing for ${currentclub}`;
        }
        else if (action === 'ask_fullname') {
            if (!(pageInfo && pageInfo.general && pageInfo.general.fullname)) {
                textRes = "I didn't get that. Can you repeat?"
            }

            let fullname = pageInfo.general.fullname;
            textRes = `Full name is ${fullname}`;
        }
        else if (action === 'ask_number') {
            if (!(pageInfo && pageInfo.general && pageInfo.general.clubnumber)) {
                textRes = "I didn't get that. Can you repeat?"
            }

            let clubnumber = pageInfo.general.clubnumber;
            textRes = `${person.name}'s club number is ${clubnumber}`;
        }
        else if (action === 'ask_position') {
            if (!(pageInfo && pageInfo.general && pageInfo.general.position)) {
                textRes = "I didn't get that. Can you repeat?"
            }

            let position = pageInfo.general.position;
            textRes = `${person.name} plays the position of  ${position.constructor === Array ? position.join(', ') : position}`;
        }
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
