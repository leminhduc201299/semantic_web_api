var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

/* GET home page. */
router.post('/chatbot', function (req, res, next) {
    (async () => {
        let url = req.body.queryResult.parameters.url;
        if (url) {
            try {
                const response = await axios.get(url);

                const $ = cheerio.load(response.data);

                /* Get product title */
                let queryTitle = $('#productTitle');
                let title;
                if (queryTitle) {
                    title = queryTitle.text();
                }

                /* Get availability */
                let queryAvailability = $('span', '#availability');
                let formattedAvailability;
                if (queryAvailability) {
                    formattedAvailability = queryAvailability.text();
                }

                /* Get price */
                let queryPrice = $('#priceblock_ourprice');
                let price;
                if (queryPrice) {
                    price = queryPrice.text();
                }

                /* Get total price */
                let totalCost;
                let queryTotalCost = $('b', '#amazonGlobal_feature_div');
                if (queryTotalCost) {
                    totalCost = queryTotalCost.text();
                }

                /* Get attribute */
                let formattedAttribute = [];
                let queryAttribute = $('span', '#productOverview_feature_div');
                if (queryAttribute) {
                    queryAttribute.each(function (i, elem) {
                        // Range Name
                        // console.log("iteration - ", i);
                        // console.log("name - ", $(this).text().trim());
                        formattedAttribute[i] = $(this).text().trim();
                    });
                }

                return res.json({
                    fulfillmentText: "fulfillmentText",
                    fulfillmentMessages: [{
                        "text": {
                            "text": [{
                                "title": title,
                                // "rating": parsedRating,
                                "availability": formattedAvailability,
                                "price": price,
                                "totalCost": totalCost,
                                "formattedAttribute": formattedAttribute,
                                // "features": formattedFeatures,
                            }]
                        }
                    }],
                    source: "webhook-sample"
                });
            }
            catch (error) {
                return res.json({
                    fulfillmentText: "fulfillmentText",
                    fulfillmentMessages: [{
                        "text": {
                            "text": ["Error"]
                        }
                    }],
                    source: "webhook-sample"
                });
            }

        }
    })();

});

module.exports = router;
