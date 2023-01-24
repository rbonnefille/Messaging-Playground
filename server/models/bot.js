/* eslint-disable no-undef */
import getCatPicture from "../utils/catApi.js";
import getChuckNorrisJoke from "../utils/chuckNorrisApi.js";
import executeQueries from "../controllers/gdf.js";
import botMessages from "../constants/botMessages.js";
import SunCoClient from "../utils/suncoApi.js";
import Reply from "./Reply.js";

const sunCo = new SunCoClient();
const replyData = new Reply();

export const getRandomFallbackMessage = () => {
  return botMessages.fallback[
    Math.floor(Math.random() * botMessages.fallback.length)
  ];
};

export const replyToUser = async (eventMessage, switchBoardMetadata) => {
  const {
    givenName,
    email,
    userExternalId,
    eventSource,
    conversation,
    recentNotifications,
  } = switchBoardMetadata;
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
      const getConvoDisplayName = await sunCo.getConversation(eventMessage);
      if (!getConvoDisplayName.conversation.displayName) {
        sunCo.updateConversation(eventMessage);
      }
      const userMetadata = await sunCo.getUser(eventMessage);
      if (Object.keys(userMetadata.user.metadata).length === 0) {
        await sunCo.updateUser(eventMessage);
      }
      replyData.message = defaultMessage;
      return sunCo.sendMessage(replyData);
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
      await getCatPicture();
      replyData.message = cat;
      replyData.image = await getCatPicture();
      return sunCo.sendMessage(replyData);
    case "agent":
    case "passControl":
    case "human":
      replyData.message = handover;
      sunCo.sendMessage(replyData);
      replyData.metadata = {
        "dataCapture.systemField.requester.name": givenName,
        "dataCapture.systemField.requester.email": email,
        "dataCapture.ticketField.360023540498": userExternalId,
        "dataCapture.systemField.tags": `${eventSource}`,
        "dataCapture.ticketField.360023540658": eventSource,
        "dataCapture.ticketField.1900005043913": conversation,
        "dataCapture.ticketField.11280496337553": recentNotifications,
      };
      return sunCo.passControl(replyData);
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
      let countDeletedConversations = 0;
      let allConversations = await sunCo.listConversations(eventMessage);
      const userConversations = Object.keys(
        allConversations.getConversations()
      ).length;
      replyData.message = `You currently have ${userConversations} ${
        userConversations > 1 ? "conversations" : "conversation"
      } opened. I will see if I can close some of them`;
      await sunCo.sendMessage(replyData);

      try {
        allConversations.conversations.forEach(async (convo) => {
          const conversationMessages = await sunCo.listMessages(convo.id);
          const convertToDate = new Date(convo.lastUpdatedAt);
          const today = new Date();
          const difference = today - convertToDate;
          let totalDays = Math.ceil(difference / (1000 * 3600 * 24));
          if (conversationMessages.messages.length === 0) {
            sunCo.deleteConversation(convo.id);
            countDeletedConversations++;
          }
          if (totalDays > 2) {
            if (
              convo.activeSwitchboardIntegration.name === "NodeJsBot" &&
              !convo.isDefault &&
              convo.id !== eventMessage.conversationId
            ) {
              // no current ticket opened
              sunCo.deleteConversation(convo.id);
              countDeletedConversations++;
            }
          }
        });
        replyData.message = countDeletedConversations
          ? `I've deleted ${countDeletedConversations} conversations as ${
              countDeletedConversations > 1 ? "they weren't" : "it wasn't"
            } liked to any opened tickets`
          : `I didn't find any conversation to delete`;
        return sunCo.sendMessage(replyData);
      } catch (error) {
        throw new Error(e.message);
      }
    case "chuck norris":
    case "chuck":
    case "norris":
    case "joke":
      replyData.message = await getChuckNorrisJoke();
      return sunCo.sendMessage(replyData);
    default:
      replyData.message = this.getRandomFallbackMessage();
      return sunCo.sendMessage(replyData);
  }
};

export default replyToUser;
