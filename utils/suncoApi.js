/* eslint-disable no-undef */
const axios = require("axios");
require("dotenv").config();

const baseUrl = "https://api.smooch.io/v2/apps/";
const podBaseUrl = "https://z3nsuncoswitchboard.zendesk.com/sc/v2/apps/";

const suncoEndpoints = {
  messages: "messages",
  activity: "activity",
  passControl: "passControl"
};

const constructBody = (data) => {
  const messageAuthor = {
    type: "business",
    displayName: data.author.botName,
    avatarUrl: data.author.avatarUrl,
  };
  if (data.image) {
    return Object.assign({
      author: messageAuthor,
      content: {
        type: "image",
        mediaUrl: data.image,
        text: data.message,
      },
    });
  } else {
    return Object.assign({
      author: messageAuthor,
      content: {
        type: "text",
        text: data.message,
      },
    });
  }
}

const activityBody = (author) =>{
  const messageAuthor = {
    type: "business",
    displayName: author.botName,
    avatarUrl: author.avatarUrl,
  };
  return Object.assign({
    author: messageAuthor,
    type: "typing:start",
  });
}

const postRequest = async (body, appId, conversationId, suncoEndpoint) => {
  const url = `${podBaseUrl}${appId}/conversations/${conversationId}/${suncoEndpoint}`;
  let response;
  try {
    response = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUNCO_JWT}`,
      },
    });
    console.log(
      `${suncoEndpoint} API called successfully for ConversationId: ${conversationId}`
    );
  } catch (e) {
    // catch error
    throw new Error(JSON.stringify(e?.response?.data, null, 2) || e);
  }
  return response;
}

const sendActivity = (data) => {
  postRequest(
    activityBody(data.author),
    data.appId,
    data.conversationId,
    suncoEndpoints.activity
  );
}

const sendMessage = (data) => {
  return postRequest(
    constructBody(data),
    data.appId,
    data.conversationId,
    suncoEndpoints.messages
  );
}

const sendResponse = (data) => {
  if (data) {
    sendActivity(data, sendMessage);
    setTimeout(sendMessage, 1100, data);
  } else {
    throw new Error("No data provided");
  }
}

const passControl = (data, switchBoardMetadata) => {
  const passControlBody = Object.assign({
    switchboardIntegration: process.env.NEXT_SWITCHBOARD_INTEGRATION,
    metadata: {
      "dataCapture.systemField.requester.name": switchBoardMetadata.givenName,
      "dataCapture.systemField.requester.email": switchBoardMetadata.email,
      "dataCapture.ticketField.360023540498": switchBoardMetadata.externalId,
      "dataCapture.systemField.tags":
        `switchBoardMetadata, ${switchBoardMetadata.eventSource}}`,
      "dataCapture.ticketField.360023540658": switchBoardMetadata.eventSource,
      "dataCapture.ticketField.1900005043913": switchBoardMetadata.conversation,
      "dataCapture.ticketField.10511574896017": !!switchBoardMetadata.recentNotifications
    }
  });
  console.log(passControlBody);
  return postRequest(
    passControlBody,
    data.appId,
    data.conversationId,
    suncoEndpoints.passControl
  );
}

module.exports = {
  passControl,
  sendResponse
};
