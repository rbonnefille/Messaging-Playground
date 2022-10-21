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
      this.data = {
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
  async replyToUser(userMessage, switchBoardMetadata) {
    switch (userMessage) {
      case "hello":
      case "hi":
      case "hey":
      case "help":
      case "start":
        this.data.message = this.messages.default;
        return sendResponse(this.data);
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
        this.data.message = this.messages.cat;
        this.data.image = catImage;
        return sendResponse(this.data);
      case "agent":
        this.data.message = this.messages.handover;
        sendResponse(this.data);
        return passControl(
          this.data,
          switchBoardMetadata
        );
      case "bot":
        this.data.message = this.messages.bot;
        return sendResponse(this.data);
      case "carousel":
        this.data.message = this.messages.carousel;
        return sendResponse(this.data);
      case "tacos":
      case "taco":
        this.data.message = this.messages.tacos;
        return sendResponse(this.data);
      case "burritos":
      case "burrito":
        this.data.message = this.messages.burrito;
        return sendResponse(this.data);
      case "compound message":
      case "compound":
        this.data.message = this.messages.compound;
        return sendResponse(this.data);
      case "file message":
      case "file":
        this.data.message = this.messages.file;
        return sendResponse(this.data);
      case "form message":
      case "form":
        this.data.message = this.messages.form;
        return sendResponse(this.data);
      case "location request":
      case "location":
        this.data.message = this.messages.location;
        return sendResponse(this.data);
      case "webview":
        this.data.message = this.messages.webview;
        return sendResponse(this.data);
      case "passControl":
        return passControl(this.data, switchBoardMetadata);
      case "gdf":
        const gdf = await executeQueries("Hey there, how are you?");
        this.data.message = gdf;
        return sendResponse(this.data);  
      default:
        this.data.message = this.messages.error;
        return sendResponse(this.data);
    }
  }
}

module.exports = Bot;
