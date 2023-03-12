// https://docs.netlify.com/functions/build/
// https://github.com/DanJFletcher/how-to-hide-api-keys-with-netlify-functions/blob/master/functions/fetch-weather/fetch-weather.js

const axios = require('axios');

const handler = async (event) => {
    const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
    const question = event.queryStringParameters.question;
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = {
        'model': 'gpt-3.5-turbo',
        'messages': [
            {
                'role': 'user',
                'content': question,
            }
        ]
    };
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPEN_AI_API_KEY}`,
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
