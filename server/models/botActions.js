/* eslint-disable no-undef */
import getCatPicture from "../utils/catApi.js";
import botMessages from "../constants/botMessages.js";
import SunCoClient from "../utils/suncoApi.js";

const sunCo = new SunCoClient();

export const getRandomFallbackMessage = () => {
  return botMessages.fallback[
    Math.floor(Math.random() * botMessages.fallback.length)
  ];
};

export const cleanConversations = async (event, replyData) => {
  let countDeletedConversations = 0;
  let allConversations = await sunCo.listConversations(event);
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
          convo.id !== event.conversationId
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
};

export const escalateToAgent = async (switchBoardMetadata, replyData, handoverMessage) => {
  const {
    givenName,
    email,
    userExternalId,
    eventSource,
    conversation,
    recentNotifications,
  } = switchBoardMetadata;
  replyData.message = handoverMessage;
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
};

export const welcomeUser = async (event, replyData, defaultMessage) => {
  const getConvoDisplayName = await sunCo.getConversation(event);
      if (!getConvoDisplayName.conversation.displayName) {
        sunCo.updateConversation(event);
      }
      const userMetadata = await sunCo.getUser(event);
      if (Object.keys(userMetadata.user.metadata).length === 0) {
        await sunCo.updateUser(event);
      }
      replyData.message = defaultMessage;
      return sunCo.sendMessage(replyData);
}

export const sendCatPicture = async (eventMessage, replyData, message) => {
  replyData.conversationId = eventMessage.conversationId;
  await getCatPicture();
      replyData.message = message;
      replyData.image = await getCatPicture();
      return sunCo.sendMessage(replyData);
}
