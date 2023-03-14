// https://docs.netlify.com/functions/build/
// https://github.com/DanJFletcher/how-to-hide-api-keys-with-netlify-functions/blob/master/functions/fetch-weather/fetch-weather.js

const axios = require('axios');

const handler = async (event) => {
    const GOOGLE_API_KEY = encodeURIComponent(process.env.GOOGLE_API_KEY);
    const token = event.queryStringParameters.token;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${GOOGLE_API_KEY}&response=${token}`;

    try {
        const { data } = await axios.post(url);
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
