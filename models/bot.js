/* eslint-disable no-undef */
const { getCatPicture } = require("../utils/catApi");
const executeQueries = require("../controllers/gdf");
const botMessages = require("../constants/botMessages");

const { passControl, sendResponse } = require("../utils/suncoApi");

class Bot {
  constructor(appId, conversationId) {
    this.replyData = {
      appId: appId,
      conversationId: conversationId,
      author: {
        avatarUrl:
          process.env.BOT_AVATAR_URL ||
          "https://media.smooch.io/apps/6062e4fb75a38000d2988959/UmpgnbGvXG7vxipmVYt-iZ59/acme.png",
        botName: process.env.BOT_NAME || "Bugs Bunny",
      },
      message: undefined,
      image: undefined,
    };
  }

  getRandomFallbackMessage() {
    return botMessages.fallback[
      Math.floor(Math.random() * botMessages.fallback.length)
    ];
  }

  async replyToUser(eventMessage, switchBoardMetadata) {
    const userQuery = eventMessage.userMessage;
    switch (userQuery) {
      case "hello":
      case "hi":
      case "hey":
      case "help":
      case "start":
      case "yo":
        this.replyData.message = botMessages.default;
        return sendResponse(this.replyData);
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
        const catImage = await getCatPicture();
        this.replyData.message = botMessages.cat;
        this.replyData.image = catImage;
        return sendResponse(this.replyData);
      case "agent":
        this.replyData.message = botMessages.handover;
        sendResponse(this.replyData);
        return passControl(this.replyData, switchBoardMetadata);
      case "bot":
        this.replyData.message = botMessages.bot;
        return sendResponse(this.replyData);
      case "carousel":
        this.replyData.message = botMessages.carousel;
        return sendResponse(this.replyData);
      case "tacos":
      case "taco":
        this.replyData.message = botMessages.tacos;
        return sendResponse(this.replyData);
      case "burritos":
      case "burrito":
        this.replyData.message = botMessages.burrito;
        return sendResponse(this.replyData);
      case "compound message":
      case "compound":
        this.replyData.message = botMessages.compound;
        return sendResponse(this.replyData);
      case "file message":
      case "file":
        this.replyData.message = botMessages.file;
        return sendResponse(this.replyData);
      case "form message":
      case "form":
        this.replyData.message = botMessages.form;
        return sendResponse(this.replyData);
      case "location request":
      case "location":
        this.replyData.message = botMessages.location;
        return sendResponse(this.replyData);
      case "webview":
        this.replyData.message = botMessages.webview;
        return sendResponse(this.replyData);
      case "passControl":
        return passControl(this.replyData, switchBoardMetadata);
      case "gdf":
        const gdf = await executeQueries("Hey there, how are you?");
        this.replyData.message = gdf;
        return sendResponse(this.replyData);
      default:
        this.replyData.message = this.getRandomFallbackMessage();
        return sendResponse(this.replyData);
    }
  }
}

module.exports = Bot;
