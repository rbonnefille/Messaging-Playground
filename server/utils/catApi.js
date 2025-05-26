import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const { CAT_API_KEY: catApiKey, CAT_API_URL: catApiUrl } = process.env;

export default async () => {
    const config = {
        headers: {
            'x-api-key': catApiKey,
        },
    };

    try {
        const response = await axios.get(catApiUrl, config);
        return response?.data[0]?.url
            ? response.data[0].url
            : 'https://cdn2.thecatapi.com/images/agb.jpg';
    } catch (e) {
        // catch error
        throw new Error(e.message);
    }
};
