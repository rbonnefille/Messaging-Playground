import axios from "axios";
import * as dotenv from 'dotenv'
dotenv.config()

const chuck_url = "https://api.chucknorris.io/jokes/random";

export default async () => {
  let response;
  try {
    response = await axios.get(chuck_url);
  } catch (e) {
    // catch error
    throw new Error(e.message)
  }
  return response?.data?.value ?? "I'm sorry, I couldn't find a joke for you but you can find a new one here: https://api.chucknorris.io/";
};