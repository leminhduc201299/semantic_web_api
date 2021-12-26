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

        let page = await wiki().page(person.name);
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
