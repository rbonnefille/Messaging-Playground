const axios = require("axios");
require("dotenv").config();

const cat_key = process.env.CAT_API_KEY;
const cat_url = process.env.CAT_API_URL;

exports.getCatPicture = async () => {
  let response;
  const config = {
    headers: {
      "x-api-key": cat_key
    }
  };

  try {
    response = await axios.get(cat_url, config);
  } catch (e) {
    // catch error
    throw new Error(e.message)
  }
  return response?.data[0]?.url ? response.data[0].url : "https://cdn2.thecatapi.com/images/agb.jpg";
}