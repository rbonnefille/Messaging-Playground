/* eslint-disable no-undef */
const { getCatPicture } = require("../utils/catApi");
const executeQueries = require("../controllers/gdf");
const botMessages = require("../constants/botMessages");
const { SunCoClient } = require("../utils/suncoApi");

class Bot {
  constructor(appId, conversationId) {
    this.sunCo = new SunCoClient();
    this.replyData = {
      appId: appId,
      conversationId: conversationId,
      author: {
        type: "business",
        avatarUrl:
          process.env.BOT_AVATAR_URL ||
          "https://media.smooch.io/apps/6062e4fb75a38000d2988959/UmpgnbGvXG7vxipmVYt-iZ59/acme.png",
        botName: process.env.BOT_NAME || "Bugs Bunny",
      },
      message: undefined,
      image: undefined,
      metadata: undefined,
    };
  }

  getRandomFallbackMessage() {
    return botMessages.fallback[
      Math.floor(Math.random() * botMessages.fallback.length)
    ];
  }

  async replyToUser(eventMessage, switchBoardMetadata) {
    const userQuery = eventMessage?.userMessage;
    switch (userQuery) {
      case "hello":
      case "hi":
      case "hey":
      case "help":
      case "start":
      case "yo":
        const getConvoDisplayName = await this.sunCo.getConversation(eventMessage);
        if (!getConvoDisplayName.conversation.displayName) {
          this.sunCo.updateConversation(eventMessage);
        }
        const userMetadata = await this.sunCo.getUser(eventMessage);
        if(Object.keys(userMetadata.user.metadata).length === 0){
          await this.sunCo.updateUser(eventMessage);
        }
        this.replyData.message = botMessages.default;
        return this.sunCo.sendMessage(this.replyData);
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
        return this.sunCo.sendMessage(this.replyData);
      case "agent":
      case "passControl":
      case "human":
        this.replyData.message = botMessages.handover;
        this.sunCo.sendMessage(this.replyData);
        this.replyData.metadata = {
          "dataCapture.systemField.requester.name":
            switchBoardMetadata.givenName,
          "dataCapture.systemField.requester.email": switchBoardMetadata.email,
          "dataCapture.ticketField.360023540498":
            switchBoardMetadata.externalId,
          "dataCapture.systemField.tags": `${switchBoardMetadata.eventSource}`,
          "dataCapture.ticketField.360023540658":
            switchBoardMetadata.eventSource,
          "dataCapture.ticketField.1900005043913":
            switchBoardMetadata.conversation,
          "dataCapture.ticketField.10511574896017":
            !!switchBoardMetadata.recentNotifications,
        };
        return this.sunCo.passControl(this.replyData);
      case "bot":
        this.replyData.message = botMessages.bot;
        return this.sunCo.sendMessage(this.replyData);
      case "carousel":
        this.replyData.message = botMessages.carousel;
        return this.sunCo.sendMessage(this.replyData);
      case "tacos":
      case "taco":
        this.replyData.message = botMessages.tacos;
        return this.sunCo.sendMessage(this.replyData);
      case "burritos":
      case "burrito":
        this.replyData.message = botMessages.burrito;
        return this.sunCo.sendMessage(this.replyData);
      case "compound message":
      case "compound":
        this.replyData.message = botMessages.compound;
        return this.sunCo.sendMessage(this.replyData);
      case "file message":
      case "file":
        this.replyData.message = botMessages.file;
        return this.sunCo.sendMessage(this.replyData);
      case "form message":
      case "form":
        this.replyData.message = botMessages.form;
        return this.sunCo.sendMessage(this.replyData);
      case "form response":
        this.replyData.message = `Thank you for providing your details.\n ${eventMessage.textFallback}`;
        return this.sunCo.sendMessage(this.replyData);
      case "location request":
      case "location":
        this.replyData.message = botMessages.location;
        return this.sunCo.sendMessage(this.replyData);
      case "webview":
        this.replyData.message = botMessages.webview;
        return this.sunCo.sendMessage(this.replyData);
      case "gdf":
        const gdf = await executeQueries("Hey there, how are you?");
        this.replyData.message = gdf;
        return this.sunCo.sendMessage(this.replyData);
      case "list":
      case "clean":
      case "clean conversations":
      case "remove":
      let countDeletedConversations = 0;

        let allConversations = await this.sunCo.listConversations(eventMessage);
        const userConversations = Object.keys(
          allConversations.getConversations()
        ).length;
        this.replyData.message = `You currently have ${userConversations} conversations opened. I will see if I can close some of them`;
        await this.sunCo.sendMessage(this.replyData);

        try {
          allConversations.conversations.forEach((convo) => {
            const convertToDate = new Date(convo.lastUpdatedAt);
            const today = new Date();
            const difference = today - convertToDate;
            let totalDays = Math.ceil(difference / (1000 * 3600 * 24));
            if (totalDays > 5) {
              if (
                convo.activeSwitchboardIntegration.name === "NodeJsBot" &&
                !convo.isDefault &&
                convo.id !== eventMessage.conversationId
              ) {
                // no current ticket opened
                this.sunCo.deleteConversation(convo.id);
                countDeletedConversations++;
              }
            }
          });
          this.replyData.message = countDeletedConversations ? `I've deleted ${countDeletedConversations} conversations as ${(countDeletedConversations > 1 ? "they weren't" : "it wasn't")} liked to any opened tickets` : `I didn't find any conversation to delete`;
          return this.sunCo.sendMessage(this.replyData);
        } catch (error) {
          throw new Error(e.message);
        }
      default:
        this.replyData.message = this.getRandomFallbackMessage();
        return this.sunCo.sendMessage(this.replyData);
    }
  }
}

module.exports = Bot;