const axios = require("axios");
require("dotenv").config();

const cat_key = process.env.CAT_API_KEY;
const cat_url = process.env.CAT_API_URL;

const getCatPicture = axios
  .get(cat_url, {
    headers: {
      "x-api-key": cat_key,
    },
  })
  .then(response => {
    // console.log(response.data[0].url);
    return response.data[0].url;
  })
  .catch(error => {
    console.error(error);
  });

module.exports = { getCatPicture };