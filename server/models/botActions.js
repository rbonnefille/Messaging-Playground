import getCatImage from '../utils/catApi.js';
import botMessages from '../constants/botMessages.js';
import SunCoClient from '../utils/suncoApi.js';

const { BOT_SWITCHBOARD_INTEGRATION_ID: botSwitboardIntegrationId } =
    process.env;

const sunCo = new SunCoClient();

export const getRandomFallbackMessage = () => {
    return botMessages.fallback[
        Math.floor(Math.random() * botMessages.fallback.length)
    ];
};

export const welcomeUser = async (event, response, defaultMessage) => {
    // const getConvoDisplayName = await sunCo.getConversation(event);
    // if (!getConvoDisplayName.conversation?.displayName) {
    //   sunCo.updateConversation(event);
    // }
    const userMetadata = await sunCo.getUser(event);
    if (
        userMetadata?.user?.metadata &&
        Object.keys(userMetadata.user.metadata).length === 0
    ) {
        await sunCo.updateUser(event);
    }
    response.setMessage(defaultMessage);
    return sunCo.sendMessage(response.toPayload());
};

const calculateDaysDifference = (date1, date2) => {
    return Math.ceil((date2 - date1) / (1000 * 3600 * 24));
};

const shouldDeleteConversation = (convo, event) => {
    return (
        convo.activeSwitchboardIntegration?.id === botSwitboardIntegrationId &&
        !convo.isDefault &&
        convo.id !== event.conversationId
    );
};

export const cleanConversations = async (event, response) => {
    let allConversations = await sunCo.listConversations(event);
    const userConversations = allConversations.conversations.length;

    response.message = `You currently have ${userConversations} ${
        userConversations > 1 ? 'conversations' : 'conversation'
    } opened. I will see if I can close some of them.`;
    await sunCo.sendMessage(response);

    try {
        let countDeletedConversations = 0;

        for (const convo of allConversations.conversations) {
            const lastUpdatedAt = new Date(convo.lastUpdatedAt);
            const today = new Date();
            const differenceInDays = calculateDaysDifference(
                lastUpdatedAt,
                today
            );

            if (
                differenceInDays > 0 &&
                shouldDeleteConversation(convo, event)
            ) {
                countDeletedConversations++;
                await sunCo.deleteConversation(convo.id);
            }
        }

        const message = countDeletedConversations
            ? `I've deleted ${countDeletedConversations} conversations as ${
                  countDeletedConversations > 1 ? "they weren't" : "it wasn't"
              } linked to any open tickets.`
            : `I didn't find any conversation to delete.`;
        response.setMessage(message);

        return await sunCo.sendMessage(response.toPayload());
    } catch (error) {
        console.error('Error cleaning conversations:', error);
        throw new Error(error.message);
    }
};

export const escalateToAgent = async (
    switchBoardMetadata,
    response,
    handoverMessage
) => {
    const {
        displayName,
        email,
        userExternalId,
        eventSource,
        conversation,
        recentNotifications,
    } = switchBoardMetadata;
    response.setMessage(handoverMessage);
    response.setMetadata({
        'dataCapture.systemField.requester.name': displayName,
        'dataCapture.systemField.requester.email': email,
        'dataCapture.ticketField.360023540498': userExternalId,
        'dataCapture.systemField.tags': `${eventSource}`,
        'dataCapture.ticketField.360023540658': eventSource,
        'dataCapture.ticketField.1900005043913': conversation,
        'dataCapture.ticketField.11280496337553': recentNotifications,
        'dataCapture.ticketField.13024896437137':
            'Data captured and passed \n into a multiline field',
    });
    const handoverPayload = response.toPayload();
    sunCo.sendMessage(handoverPayload);
    return sunCo.passControl(handoverPayload);
};

export const escalateToAnswerBot = async (eventMessage) => {
    const { integrationId, conversationId } = eventMessage;
    const payload = {
        conversationId: conversationId,
        metadata: {
            'zen:answerbot:execute_flow': `channel=${integrationId}`,
        },
    };
    return sunCo.passControl(payload, 'zd-answerBot');
};

export const sendCatImage = async (eventMessage, response, message) => {
    try {
        const catImageUrl = await getCatImage();
        response.conversationId = eventMessage.conversationId;
        response.setMessage(message);
        response.setImage(catImageUrl);
        return await sunCo.sendMessage(response.toPayload());
    } catch (error) {
        console.error('Error sending cat picture:', error);
        throw error;
    }
};
