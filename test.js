const req = {"app":{"id":"6062e4fb75a38000d2988959"},"webhook":{"id":"6267d05187115600f3413cd0","version":"v2"},"events":[{"id":"62e155a4f4a8e500efc0c3ad","createdAt":"2022-07-27T15:11:32.115Z","type":"conversation:message","payload":{"conversation":{"id":"99e8a7ae123e7ad9361b7853","type":"personal","brandId":"7053819905425","activeSwitchboardIntegration":{"id":"611a400bfb81e100d3d77557","name":"NodeJsBot","integrationId":"6267d05187115600f3413cd1","integrationType":"custom"}},"message":{"id":"62e155a4aff73700f08bcd77","received":"2022-07-27T15:11:32.115Z","author":{"userId":"6df4a6db1e81b11f4bf3543b","displayName":"Romain","type":"user","user":{"id":"6df4a6db1e81b11f4bf3543b","profile":{"givenName":"Romain"},"signedUpAt":"2022-05-11T09:28:49.246Z","metadata":{}}},"content":{"type":"text","text":"Help","payload":"help"},"source":{"integrationId":"60646995cf2f4600d2bbfead","originalMessageId":"wamid.HBgMMzUzODMwMDU1NTUwFQIAEhggQUU4MDVEMjBFRjJDNDhFOTg3MjUzQ0IxRThGNjdGRDIA","originalMessageTimestamp":"2022-07-27T15:11:30.000Z","type":"whatsapp"}}}}]};

const {
    app: appId,
    events: [messageEvent],
} = req;

const {
    type: messageEventType,
    payload: {
        conversation: {
            id: conversationId,
            activeSwitchboardIntegration: {
                id: activeSwitchboardIntegration,
            } = { id: "611a400bfb81e100d3d77557" },
        },
        message: {
            author: { userId, type: authorType, displayName },
            user: {
                externalId: externalId } = { externalId: `${userId}` },
            profile: { email } = { email: `${userId}@example.com` },
            content: { text: userMessage, type: contentType, payload: contentPayload } = { text: "hi", type: "text", payload: "hi" },
            source: { integrationId: sourceIntegrationId , type: sourceType },
        },
    },
} = messageEvent || {};




const switchBoardMetadata = {
    givenName: displayName,
    email: email,
    externalId: externalId,
    eventSource: sourceType,
    eventSourceIntegrationId: sourceIntegrationId,
    conversation: conversationId,
};

console.log(switchBoardMetadata);
console.log(userMessage);
console.log(contentType);
console.log(contentPayload);

console.log(userId, authorType, displayName, messageEventType);


