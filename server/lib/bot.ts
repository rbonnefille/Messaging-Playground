import getChuckNorrisJoke from '../utils/chuckNorrisApi'
import botMessages from './botMessages'
import SunCoClient from '../utils/sunco'
import {
  getRandomFallbackMessage,
  cleanConversations,
  escalateToAgent,
  escalateToAnswerBot,
  welcomeUser,
  sendCatImage,
} from './botActions'
import BotResponse from './BotResponse'
import type ConversationEvent from './webhook'
import type PassControlMetadata from './passControlMetadata'

const sunCo = new SunCoClient()

export const replyToUser = async (
  eventMessage: ConversationEvent,
  switchBoardMetadata: PassControlMetadata,
): Promise<unknown> => {
  const { userMessage, conversationId } = eventMessage
  const response = new BotResponse(conversationId)
  const {
    default: defaultMessage,
    bot,
    carousel,
    compound,
    file,
    form,
    location,
    tacos,
    burrito,
    cat,
    handover,
    webview,
  } = botMessages
  switch (userMessage) {
    case 'hello':
    case 'hi':
    case 'hey':
    case 'help':
    case 'start':
    case 'yo':
    case 'hello i need help':
      return await welcomeUser(eventMessage, response, defaultMessage)
    case 'cat':
    case 'cats':
    case '🐱':
    case '😼':
    case '😹':
    case '🙀':
    case '😾':
    case '😿':
    case '😻':
    case '😺':
    case '😸':
    case '😽':
    case '🐈':
      return await sendCatImage(eventMessage, response, cat)
    case 'agent':
    case 'speak to an agent':
    case 'speak with an agent':
    case 'speak to agent':
    case 'talk to agent':
    case 'passControl':
    case 'human':
      return await escalateToAgent(switchBoardMetadata, response, handover)
    case 'bot':
      response.message = bot
      return sunCo.sendMessage(response)
    case 'ab':
    case 'Answer Bot':
    case 'answer bot':
    case 'zendesk bot':
    case 'zd bot':
    case 'escalate to answer bot':
      return await escalateToAnswerBot(eventMessage)
    case 'carousel':
      response.message = carousel
      return sunCo.sendMessage(response)
    case 'tacos':
    case 'taco':
      response.message = tacos
      return sunCo.sendMessage(response)
    case 'burritos':
    case 'burrito':
      response.message = burrito
      return sunCo.sendMessage(response)
    case 'compound message':
    case 'compound':
      response.message = compound
      return sunCo.sendMessage(response)
    case 'file message':
    case 'file':
      response.message = file
      return sunCo.sendMessage(response)
    case 'form message':
    case 'form':
      response.message = form
      return sunCo.sendMessage(response)
    case 'form response':
      response.message = `Thank you for providing your details.\n ${eventMessage.textFallback}`
      return sunCo.sendMessage(response)
    case 'location request':
    case 'location':
      response.message = location
      return sunCo.sendMessage(response)
    case 'webview':
      response.message = webview
      return sunCo.sendMessage(response)
    case 'list':
    case 'clean':
    case 'clean conversations':
    case 'remove':
      return await cleanConversations(eventMessage, response)
    case 'chuck norris':
    case 'chuck':
    case 'norris':
    case 'joke':
      response.message = await getChuckNorrisJoke()
      return sunCo.sendMessage(response)
    case 'sdkgroup':
      response.message = 'Welcome! This is a group conversation'
      return sunCo.sendMessage(response)
    case 'release control':
      response.message = `I will release the conversation's control now`
      response.metadata = {
        'dataCapture.systemField.tags': 'releasedByBot',
        'dataCapture.systemField.priority': 'high',
      }
      await sunCo.sendMessage(response)
      return await sunCo.releaseControl(response)
    default:
      response.message = getRandomFallbackMessage()
      return sunCo.sendMessage(response)
  }
}

export default replyToUser
