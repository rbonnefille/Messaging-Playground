import axios from 'axios';

const { CAT_API_KEY: catApiKey, CAT_API_URL: catApiUrl } = process.env;

const getCatImage = async (): Promise<string> => {
    const config = {
        headers: {
            'x-api-key': catApiKey as string,
        },
    };

    try {
        const response = await axios.get(catApiUrl as string, config);
        return response?.data[0]?.url
            ? response.data[0].url
            : 'https://cdn2.thecatapi.com/images/agb.jpg';
    } catch (e) {
        throw new Error((e as Error).message, { cause: e });
    }
};

export default getCatImage;
