import axios from "axios";
import * as dotenv from 'dotenv'
dotenv.config()

const cat_key = process.env.CAT_API_KEY;
const cat_url = process.env.CAT_API_URL;

export default async () => {
  const config = {
    headers: {
      "x-api-key": cat_key
    }
  };

  try {
    const response = await axios.get(cat_url, config);
    return response?.data[0]?.url ? response.data[0].url : "https://cdn2.thecatapi.com/images/agb.jpg";
  } catch (e) {
    // catch error
    throw new Error(e.message)
  }
}