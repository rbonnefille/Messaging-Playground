  // Desctructre the request body
    // const {
    //     app: { id: appId } ,
    //     events: [messageEvent],
    // } = req.body;
    
    // const {
    //     type: messageEventType,
    //     payload: {
    //         conversation: {
    //             id: conversationId,
    //             activeSwitchboardIntegration: {
    //                 id: activeSwitchboardIntegrationId,
    //             } = {},
    //         },
    //         message: {
    //             author: { userId, displayName: displayName, type: authorType, user: { externalId, profile: { surname, givenName, email, locale } } } = {},
    //             content: { text: userMessage, type: contentType, payload: contentPayload } = { text: "hi", type: "text", payload: "hi" },
    //             source: { integrationId: sourceIntegrationId , type: sourceType },
    //         } = {},
    //     },
    // } = messageEvent || {};