/* eslint-disable no-undef */
const { sendActivity, sendMessage, passControl } = require('../utils/suncoMethods');

class Bot {
    constructor(appId, conversationId) {
        this.appId = appId;
        this.conversationId = conversationId;
        // this.avatarUrl =
        //     "https://i.pinimg.com/236x/a7/f8/ab/a7f8ab865a42a916a0fc8d99aea3bf27.jpg";
        this.avatarUrl = "https://media.smooch.io/apps/6062e4fb75a38000d2988959/UmpgnbGvXG7vxipmVYt-iZ59/acme.png";
        this.botName = "Bugs Bunny";
        this.typingStart = "typing:start";
        this.welcomeMessage =
            "Hey there! Welcome to Acme Corp Support, I'm Bugs Bunny, how can I help you today?";
        this.transferMessage = "Ok let me transfer you to a Zendesk agent.";
        this.nextSwitchboardIntegration = "zd-agentWorkspace";
        this.defaultMessage =
            "Sorry I didn't get that. Can you please try to say something else?";
        this.botMessage =
            "I'm a bot, I'm not a real person. I'm just a bot that can help you with your problems.";
        this.carouselMessage = "%((template:mexican_carousel))%";
        this.tacosMessage = "🌮 are so yummy!!!";
        this.burritoMessage = "🌯 are so yummy too!!!";
        this.catMessage = "Here's a cat picture for you!";
    }

    replyToUser(userMessage, switchBoardMetadata) {
        switch (userMessage) {
            case "hello":
            case "hi":
            case "hey":
            case "help":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    this.welcomeMessage,
                    "flow",
                    this.botName,
                    this.avatarUrl
                );
                break;
            case "cat":
                    sendMessage(
                    this.appId,
                    this.conversationId,
                    this.catMessage,
                    "cat",
                    this.botName,
                    this.avatarUrl);
                break;
            case "agent":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    this.transferMessage,
                    "default",
                    this.botName,
                    this.avatarUrl
                );
                passControl(
                    this.appId,
                    this.conversationId,
                    this.nextSwitchboardIntegration,
                    switchBoardMetadata
                );
                break;
            case "bot":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    this.botMessage,
                    "flow",
                    this.botName,
                    this.avatarUrl
                );
                break;
            case "carousel":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    this.carouselMessage,
                    "default",
                    this.botName,
                    this.avatarUrl
                );
                break;
            case "tacos":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    this.tacosMessage,
                    "default",
                    this.botName,
                    this.avatarUrl
                );
                break;
            case "burritos":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    this.burritoMessage,
                    "default",
                    this.botName,
                    this.avatarUrl
                );
                break;
            case "compound message":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    "%((template: smooch_tmpl_family_basket))%",
                    "default",
                    this.botName,
                    this.avatarUrl
                );
                break;
            case "file message":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    "%((template: smooch_tmpl_warranty))%",
                    "default",
                    this.botName,
                    this.avatarUrl
                );
                break;
            case "form message":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    "%((template: smooch_tmpl_lead_capture))%",
                    "default",
                    this.botName,
                    this.avatarUrl
                );
                break;
            case "location request":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    "%((template: smooch_tmpl_request_location))%",
                    "default",
                    this.botName,
                    this.avatarUrl
                );
                break;
            case "start":
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    this.welcomeMessage,
                    "flow",
                    this.botName,
                    this.avatarUrl
                );
                break;
            default:
                sendActivity(
                    this.appId,
                    this.conversationId,
                    this.typingStart,
                    this.botName,
                    this.avatarUrl
                );
                setTimeout(
                    sendMessage,
                    2000,
                    this.appId,
                    this.conversationId,
                    this.defaultMessage,
                    "flow",
                    this.botName,
                    this.avatarUrl
                );
                break;
        }
    }
}

module.exports = Bot;
