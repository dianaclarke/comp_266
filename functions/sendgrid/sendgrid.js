// https://docs.netlify.com/functions/build/
// https://github.com/DanJFletcher/how-to-hide-api-keys-with-netlify-functions/blob/master/functions/fetch-weather/fetch-weather.js

const axios = require('axios');

const handler = async (event) => {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_TO_EMAIL = process.env.SENDGRID_TO_EMAIL;
    const name = event.queryStringParameters.name;
    const from = event.queryStringParameters.email;
    const msg = event.queryStringParameters.message;
    const url = 'https://api.sendgrid.com/v3/mail/send';
    const body = {
        'personalizations': [{
            'to': [{ 'email': SENDGRID_TO_EMAIL }]
        }],
        'from': { 'email': from },
        'subject': `Contact read-watch-test: ${name}`,
        'content': [{ 'type': 'text/plain', 'value': msg }],
    }
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        }
    };

    try {
        const { data } = await axios.post(url, body, config);
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        const { status, statusText, headers, data } = error.response;
        return {
            statusCode: status,
            body: JSON.stringify({ status, statusText, headers, data }),
        };
    }
}

module.exports = { handler };
