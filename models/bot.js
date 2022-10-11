/* eslint-disable no-undef */
const { getCatPicture } = require("../utils/catApi");

const {
  sendActivity,
  sendMessage,
  passControl,
} = require("../utils/suncoMethods");

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
      handover: "I'm going to transfer you to a human agent."
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
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
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
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
      case "agent":
        this.data.message = this.messages.handover;
        sendActivity(this.data);
        setTimeout(sendMessage, 2000, this.data);
        return passControl(
          this.data,
          switchBoardMetadata
        );
      case "bot":
        this.data.message = this.messages.bot;
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
      case "carousel":
        this.data.message = this.messages.carousel;
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
      case "tacos":
        this.data.message = this.messages.tacos;
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
      case "burritos":
        this.data.message = this.messages.burrito;
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
      case "compound message":
        this.data.message = this.messages.compound;
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
      case "file message":
        this.data.message = this.messages.file;
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
      case "form message":
        this.data.message = this.messages.form;
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
      case "location request":
        this.data.message = this.messages.location;
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
      default:
        this.data.message = this.messages.default;
        sendActivity(this.data);
        return setTimeout(sendMessage, 2000, this.data);
    }
  }
}

module.exports = Bot;
