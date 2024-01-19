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
};

export const cleanConversations = async (event, replyData) => {
  let allConversations = await sunCo.listConversations(event);
  const userConversations = Object.keys(
    allConversations.getConversations()
  ).length;
  replyData.message = `You currently have ${userConversations} ${
    userConversations > 1 ? "conversations" : "conversation"
  } opened. I will see if I can close some of them`;
  await sunCo.sendMessage(replyData);
  try {
    let countDeletedConversations = 0;
    allConversations.conversations.forEach(async (convo) => {
      const convertToDate = new Date(convo.lastUpdatedAt);
      const today = new Date();
      const difference = today - convertToDate;
      let totalDays = Math.ceil(difference / (1000 * 3600 * 24));
      if (totalDays > 0) {
        if (
          convo.activeSwitchboardIntegration?.id ===
            process.env.BOT_SWITCHBOARD_INTEGRATION_ID &&
          !convo.isDefault &&
          convo.id !== event.conversationId
        ) {
          // no current ticket opened
          countDeletedConversations++;
          sunCo.deleteConversation(convo.id);
        }
      }
    });
    replyData.message = countDeletedConversations
      ? `I've deleted ${countDeletedConversations} conversations as ${
          countDeletedConversations > 1 ? "they weren't" : "it wasn't"
        } liked to any opened tickets`
      : `I didn't find any conversation to delete`;
    return await sunCo.sendMessage(replyData);
  } catch (error) {
    throw new Error(e.message);
  }
};

export const escalateToAgent = async (
  switchBoardMetadata,
  replyData,
  handoverMessage
) => {
  const {
    displayName,
    email,
    userExternalId,
    eventSource,
    conversation,
    recentNotifications,
  } = switchBoardMetadata;
  replyData.message = handoverMessage;
  sunCo.sendMessage(replyData);
  replyData.metadata = {
    "dataCapture.systemField.requester.name": displayName,
    "dataCapture.systemField.requester.email": email,
    "dataCapture.ticketField.360023540498": userExternalId,
    "dataCapture.systemField.tags": `${eventSource}`,
    "dataCapture.ticketField.360023540658": eventSource,
    "dataCapture.ticketField.1900005043913": conversation,
    "dataCapture.ticketField.11280496337553": recentNotifications,
    "dataCapture.ticketField.13024896437137":
      "Data captured and passed \n into a multiline field",
  };
  return sunCo.passControl(replyData);
};

export const escalateToAnswerBot = async (eventMessage) => {
  const { integrationId, conversationId } = eventMessage;
  const payload = {
    conversationId: conversationId,
    metadata: {
      "zen:answerbot:execute_flow": `channel=${integrationId}`,
    },
  };
  return sunCo.passControl(payload, "zd-answerBot");
};

export const sendCatPicture = async (eventMessage, replyData, message) => {
  replyData.conversationId = eventMessage.conversationId;
  await getCatPicture();
  replyData.message = message;
  replyData.image = await getCatPicture();
  return sunCo.sendMessage(replyData);
};
