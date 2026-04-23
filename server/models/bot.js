import getChuckNorrisJoke from '../utils/chuckNorrisApi.js';
// import executeQueries from '../controllers/gdf.js';
import botMessages from '../constants/botMessages.js';
import SunCoClient from '../utils/suncoApi.js';
import {
    getRandomFallbackMessage,
    cleanConversations,
    escalateToAgent,
    escalateToAnswerBot,
    welcomeUser,
    sendCatImage,
} from './botActions.js';
import BotResponse from './BotResponse.js';
import axios from 'axios';
const sunCo = new SunCoClient();

export const replyToUser = async (eventMessage, switchBoardMetadata) => {
    const { userMessage, conversationId } = eventMessage;
    const response = new BotResponse(conversationId);
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
    } = botMessages;
    switch (userMessage) {
        case 'hello':
        case 'hi':
        case 'hey':
        case 'help':
        case 'start':
        case 'yo':
        case 'hello i need help':
            return await welcomeUser(eventMessage, response, defaultMessage);
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
            return await sendCatImage(eventMessage, response, cat);
        case 'agent':
        case 'speak to an agent':
        case 'speak with an agent':
        case 'speak to agent':
        case 'talk to agent':
        case 'passControl':
        case 'human':
            return await escalateToAgent(
                switchBoardMetadata,
                response,
                handover
            );
        case 'bot':
            response.message = bot;
            return sunCo.sendMessage(response);
        case 'ab':
        case 'Answer Bot':
        case 'answer bot':
        case 'zendesk bot':
        case 'zd bot':
        case 'zd bot':
        case 'escalate to answer bot':
            return await escalateToAnswerBot(eventMessage);
        case 'carousel':
            response.message = carousel;
            return sunCo.sendMessage(response);
        case 'tacos':
        case 'taco':
            response.message = tacos;
            return sunCo.sendMessage(response);
        case 'burritos':
        case 'burrito':
            response.message = burrito;
            return sunCo.sendMessage(response);
        case 'compound message':
        case 'compound':
            response.message = compound;
            return sunCo.sendMessage(response);
        case 'file message':
        case 'file':
            response.message = file;
            return sunCo.sendMessage(response);
        case 'form message':
        case 'form':
            response.message = form;
            return sunCo.sendMessage(response);
        case 'form response':
            response.message = `Thank you for providing your details.\n ${eventMessage.textFallback}`;
            return sunCo.sendMessage(response);
        case 'location request':
        case 'location':
            response.message = location;
            return sunCo.sendMessage(response);
        case 'webview':
            response.message = webview;
            return sunCo.sendMessage(response);
        // case 'gdf':
        //   response.message = await executeQueries('Hey there, how are you?');
        //   return sunCo.sendMessage(response);
        case 'list':
        case 'clean':
        case 'clean conversations':
        case 'remove':
            return await cleanConversations(eventMessage, response);
        case 'chuck norris':
        case 'chuck':
        case 'norris':
        case 'joke':
            response.message = await getChuckNorrisJoke();
            return sunCo.sendMessage(response);
        case 'sdkgroup':
            response.message = 'Welcome! This is a group conversation';
            return sunCo.sendMessage(response);
        case 'release control':
            response.message = `I will release the conversation's control now`;
            response.metadata = {
                'dataCapture.systemField.tags': 'releasedByBot',
                'dataCapture.systemField.priority': 'high',
            };
            await sunCo.sendMessage(response);
            return await sunCo.releaseControl(response);
        default:
            response.message = getRandomFallbackMessage();
            return sunCo.sendMessage(response);
        // try {
        //   await sunCo.postActivity(response);
        //   const response = await axios.post(
        //     process.env.ZD_OPENAI_URL,
        //     {
        //       model: "gpt-4",
        //       messages: [{ role: "user", content: userMessage }],
        //       temperature: 0.7,
        //     },
        //     {
        //       headers: {
        //         "User-Agent": "sunco-bot-chat-robot",
        //         "Content-Type": "application/json",
        //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        //       },
        //     }
        //   );

        //   const replyText = response.data?.choices[0]?.message?.content;
        //   response.message = replyText;
        //   return sunCo.sendMessage(response);
        // } catch (error) {
        //   console.error(error);
        // }
    }
};

export default replyToUser;
