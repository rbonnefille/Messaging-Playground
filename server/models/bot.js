/* eslint-disable no-undef */
import getChuckNorrisJoke from "../utils/chuckNorrisApi.js";
import executeQueries from "../controllers/gdf.js";
import botMessages from "../constants/botMessages.js";
import SunCoClient from "../utils/suncoApi.js";
import {
  getRandomFallbackMessage,
  cleanConversations,
  escalateToAgent,
  welcomeUser,
  sendCatPicture,
} from "./BotActions.js";
import Reply from "./Reply.js";

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
      replyData.message = getRandomFallbackMessage();
      return sunCo.sendMessage(replyData);
  }
};

export default replyToUser;
