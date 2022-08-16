require('dotenv').config();

const {
    WEBHOOK_CONVERSATIONS_SECRET: webhookConversationsSecret,
    BOT_SWITCHBOARD_INTEGRATION_ID: botSwitchboardIntegration
  } = process.env;

const isAuthenticatedRequest = (webhookSecret) => {
    return webhookSecret === webhookConversationsSecret;
}
const isCurrentSwitchboardIntegration = (activeSwitchboardIntegration) => {
    return activeSwitchboardIntegration === botSwitchboardIntegration;
}
const isUserMessage = (authorType) => {
    return authorType === "user";
}
const isConversationCreate = (messageEventType) => {
    return messageEventType === "conversation:create";
}
const isTextMessage = (contentType) => {
    return contentType === "text";
}
const isIgnoredChannel = (sourceType) =>{
    return sourceType === "twitter" || sourceType === "instagram" || sourceType === "web";
}

const isCreationReasonStartConversation = (creationReason) => {
    return creationReason === "startConversation";
}

module.exports = { isAuthenticatedRequest, isCurrentSwitchboardIntegration, isUserMessage, isConversationCreate, isTextMessage, isIgnoredChannel, isCreationReasonStartConversation };