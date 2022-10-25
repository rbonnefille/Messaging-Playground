/* eslint-disable no-undef */
const { getCatPicture } = require("../utils/catApi");
const executeQueries = require("../controllers/gdf");

const {
  passControl,
  sendResponse
} = require("../utils/suncoApi");

class Bot {
  constructor(appId, conversationId) {
    this.messages = {
      default:
        "%((template:quick_replies))%",
      error:
        "Sorry I didn't get that. Can you please try to say something else?",
      bot: "I'm a bot, I'm not a real person. I'm just a bot that can help you with your problems.",
      carousel: "%((template:mexican_carousel))%",
      compound: "%((template: smooch_tmpl_family_basket))%",
      file: "%((template: smooch_tmpl_warranty))%",
      form: "%((template: smooch_tmpl_lead_capture))%",
      location: "%((template: smooch_tmpl_request_location))%",
      tacos: "🌮 are so yummy!!!",
      burrito: "🌯 are so yummy too!!!",
      cat: "Here's a cat picture for you!",
      handover: "I'm going to transfer you to a human agent.",
      webview: "%((template: webview))%"
    };
      this.replyData = {
        appId: appId,
        conversationId: conversationId,
        author: {
          avatarUrl:
            "https://media.smooch.io/apps/6062e4fb75a38000d2988959/UmpgnbGvXG7vxipmVYt-iZ59/acme.png",
          botName: "Bugs Bunny",
        },
        message: undefined,
        image: undefined
      };
  }

  async replyToUser(eventMessage, switchBoardMetadata) {
    const userQuery = eventMessage.userMessage;
    switch (userQuery) {
      case "hello":
      case "hi":
      case "hey":
      case "help":
      case "start":
        this.replyData.message = this.messages.default;
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
        this.replyData.message = this.messages.cat;
        this.replyData.image = catImage;
        return sendResponse(this.replyData);
      case "agent":
        this.replyData.message = this.messages.handover;
        sendResponse(this.replyData);
        return passControl(
          this.replyData,
          switchBoardMetadata
        );
      case "bot":
        this.replyData.message = this.messages.bot;
        return sendResponse(this.replyData);
      case "carousel":
        this.replyData.message = this.messages.carousel;
        return sendResponse(this.replyData);
      case "tacos":
      case "taco":
        this.replyData.message = this.messages.tacos;
        return sendResponse(this.replyData);
      case "burritos":
      case "burrito":
        this.replyData.message = this.messages.burrito;
        return sendResponse(this.replyData);
      case "compound message":
      case "compound":
        this.replyData.message = this.messages.compound;
        return sendResponse(this.replyData);
      case "file message":
      case "file":
        this.replyData.message = this.messages.file;
        return sendResponse(this.replyData);
      case "form message":
      case "form":
        this.replyData.message = this.messages.form;
        return sendResponse(this.replyData);
      case "location request":
      case "location":
        this.replyData.message = this.messages.location;
        return sendResponse(this.replyData);
      case "webview":
        this.replyData.message = this.messages.webview;
        return sendResponse(this.replyData);
      case "passControl":
        return passControl(this.replyData, switchBoardMetadata);
      case "gdf":
        const gdf = await executeQueries("Hey there, how are you?");
        this.replyData.message = gdf;
        return sendResponse(this.replyData);  
      default:
        this.replyData.message = this.messages.error;
        return sendResponse(this.replyData);
    }
  }
}

module.exports = Bot;
