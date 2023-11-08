import replyToUser from "../models/bot.js";
import ConversationEvent from "../models/Webhook.js";
import PassControlMetadata from "../models/PassControlMetadata.js";
// import SunCoClient from "../utils/suncoApi.js";

// const sunCo = new SunCoClient();

const messageEvents = async (req, res, next) => {
  const webhookEvent = new ConversationEvent(req);
  const {
    webhookEventApiKey,
    activeSwitchboardIntegrationId,
    authorType,
    contentType,
    textFallback,
    creationReason,
  } = webhookEvent;
  const metadata = new PassControlMetadata(webhookEvent);

  if (!webhookEvent.isAuthenticatedRequest(webhookEventApiKey)) {
    res.sendStatus(401).end();
    return;
  }

  if (
    !webhookEvent.isCurrentSwitchboardIntegration(
      activeSwitchboardIntegrationId
    )
  ) {
    res.sendStatus(200).end();
    return;
  }
  //Handle events
  if (
    webhookEvent.isConversationMessage() ||
    webhookEvent.isConversationPostback()
  ) {
    if (webhookEvent.isBusinessMessage(authorType)) {
      res.sendStatus(200).end();
      return;
    }

    // temporary test

    // if (webhookEvent.isTextMessage(contentType) && webhookEvent.isSocialChannel() && webhookEvent.isCurrentSwitchboardIntegration(activeSwitchboardIntegrationId)) {
    //   console.log("handling social channel message and handover to Answer Bot")
    //   const payload = {
    //     conversationId: webhookEvent.conversationId
    //   }
    //   await sunCo.passControl(payload, "635aa5aa8f3bb100ff197efe");
    //   const messagePayload = {
    //     conversationId: webhookEvent.conversationId,
    //     author: {
    //       type: "user",
    //       userId: webhookEvent.userId,
    //       displayName: webhookEvent.displayName
    //     },
    //     message: "Answer Bot",
    //     metadata: metadata
    //   }
    //   return await sunCo.sendMessage(messagePayload);
    // }

    if (
      webhookEvent.isTextMessage(contentType) &&
      webhookEvent.isAllowedChannel()
    ) {
      try {
        if (webhookEvent.userMessage) {
          replyToUser(webhookEvent, metadata);
        }
      } catch (err) {
        console.log(`Error in message handler ${err}`);
        res.status(500).send({ error: "Something failed!" });
      }
    } else if (
      webhookEvent.isAllowedChannel() &&
      webhookEvent.ifFormMessage(contentType)
    ) {
      try {
        if (textFallback) {
          webhookEvent.userMessage = "form response";
          replyToUser(webhookEvent, metadata);
        }
      } catch (err) {
        console.log(`Error in message handler ${err}`);
        res.status(500).send({ error: "Something failed!" });
      }
    }
    res.end();
  } else if (webhookEvent.isConversationCreate()) {
    if (
      webhookEvent.isCreationReasonStartConversation(creationReason) &&
      webhookEvent.isAllowedChannel()
    ) {
      try {
        webhookEvent.userMessage = "start";
        replyToUser(webhookEvent, metadata);
        res.end();
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Something failed!" });
      }
      res.end();
    } else {
      res.end();
    }
  } else if (webhookEvent.isConversationRead()) {
    res.sendStatus(200).end();
    return;
  }
};

export default messageEvents;
