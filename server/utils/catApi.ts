import axios from 'axios'

const getCatImage = async (): Promise<string> => {
  const { catApiKey, catApiUrl } = useRuntimeConfig()
  const axiosConfig = { headers: { 'x-api-key': catApiKey } }
  try {
    const response = await axios.get(catApiUrl, axiosConfig)
    return response?.data[0]?.url
      ? response.data[0].url
      : 'https://cdn2.thecatapi.com/images/agb.jpg'
  } catch (e) {
    throw new Error((e as Error).message)
  }
}

export default getCatImage
