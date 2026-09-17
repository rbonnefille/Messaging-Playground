import axios from 'axios'

const chuckApiUrl = 'https://api.chucknorris.io/jokes/random'

const getChuckNorrisJoke = async (): Promise<string> => {
  try {
    const response = await axios.get(chuckApiUrl)
    return (
      response?.data?.value ??
      "I'm sorry, I couldn't find a joke for you but you can find a new one here: https://api.chucknorris.io/"
    )
  } catch (e) {
    throw new Error((e as Error).message)
  }
}

export default getChuckNorrisJoke
