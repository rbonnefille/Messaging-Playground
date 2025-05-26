import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const chuckApiUrl = 'https://api.chucknorris.io/jokes/random';

export default async () => {
    try {
        const response = await axios.get(chuckApiUrl);
        return (
            response?.data?.value ??
            "I'm sorry, I couldn't find a joke for you but you can find a new one here: https://api.chucknorris.io/"
        );
    } catch (e) {
        // catch error
        throw new Error(e.message);
    }
};
