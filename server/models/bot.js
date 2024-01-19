/* eslint-disable no-undef */
import getChuckNorrisJoke from "../utils/chuckNorrisApi.js";
import executeQueries from "../controllers/gdf.js";
import botMessages from "../constants/botMessages.js";
import SunCoClient from "../utils/suncoApi.js";
import {
  getRandomFallbackMessage,
  cleanConversations,
  escalateToAgent,
  escalateToAnswerBot,
  welcomeUser,
  sendCatPicture,
} from "./BotActions.js";
import Reply from "./Reply.js";
import axios from "axios";
const sunCo = new SunCoClient();

export const replyToUser = async (eventMessage, switchBoardMetadata) => {
  const replyData = new Reply();
  const { userMessage, conversationId } = eventMessage;
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
  replyData.conversationId = conversationId;
  switch (userMessage) {
    case "hello":
    case "hi":
    case "hey":
    case "help":
    case "start":
    case "yo":
    case "hello i need help":
      return await welcomeUser(eventMessage, replyData, defaultMessage);
    case "cat":
    case "cats":
    case "🐱":
    case "😼":
    case "😹":
    case "🙀":
    case "😾":
    case "😿":
    case "😻":
    case "😺":
    case "😸":
    case "😽":
    case "🐈":
      return await sendCatPicture(eventMessage, replyData, cat);
    case "agent":
    case "speak to an agent":
    case "speak with an agent":
    case "speak to agent":
    case "talk to agent":
    case "passControl":
    case "human":
      return await escalateToAgent(switchBoardMetadata, replyData, handover);
    case "bot":
      replyData.message = bot;
      return sunCo.sendMessage(replyData);
    case "ab":
    case "Answer Bot":
    case "answer bot":
    case "zendesk bot":
    case "zd bot":
    case "ZD bot":
      return await escalateToAnswerBot(eventMessage);
    case "carousel":
      replyData.message = carousel;
      return sunCo.sendMessage(replyData);
    case "tacos":
    case "taco":
      replyData.message = tacos;
      return sunCo.sendMessage(replyData);
    case "burritos":
    case "burrito":
      replyData.message = burrito;
      return sunCo.sendMessage(replyData);
    case "compound message":
    case "compound":
      replyData.message = compound;
      return sunCo.sendMessage(replyData);
    case "file message":
    case "file":
      replyData.message = file;
      return sunCo.sendMessage(replyData);
    case "form message":
    case "form":
      replyData.message = form;
      return sunCo.sendMessage(replyData);
    case "form response":
      replyData.message = `Thank you for providing your details.\n ${eventMessage.textFallback}`;
      return sunCo.sendMessage(replyData);
    case "location request":
    case "location":
      replyData.message = location;
      return sunCo.sendMessage(replyData);
    case "webview":
      replyData.message = webview;
      return sunCo.sendMessage(replyData);
    case "gdf":
      replyData.message = await executeQueries("Hey there, how are you?");
      return sunCo.sendMessage(replyData);
    case "list":
    case "clean":
    case "clean conversations":
    case "remove":
      return await cleanConversations(eventMessage, replyData);
    case "chuck norris":
    case "chuck":
    case "norris":
    case "joke":
      replyData.message = await getChuckNorrisJoke();
      return sunCo.sendMessage(replyData);
    default:
      try {
        await sunCo.postActivity(replyData);
        const response = await axios.post(
          process.env.ZD_OPENAI_URL,
          {
            model: "gpt-4",
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7,
          },
          {
            headers: {
              "User-Agent": "sunco-bot-chat-robot",
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
          }
        );

        const replyText = response.data?.choices[0]?.message?.content;
        replyData.message = replyText;
        return sunCo.sendMessage(replyData);
      } catch (error) {
        console.error(error);
      }
  }
};

export default replyToUser;
