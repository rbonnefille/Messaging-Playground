import express from 'express';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid';
import * as dialogflow from '@google-cloud/dialogflow';

const sessionClient: any = new dialogflow.SessionsClient();
const projectId = 'sunco-bxgh';
const sessionId = uuidv4();
const languageCode = 'en-US';

async function detectIntent(
    projectId: string,
    sessionId: string,
    query: string,
    contexts: any[],
    languageCode: string
): Promise<any> {
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    const request: any = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    if (contexts && contexts.length > 0) {
        request.queryParams = {
            contexts: contexts,
        };
    }

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

async function executeQueries(query: string): Promise<string | undefined> {
    const projectId = 'sunco-bxgh';
    const sessionId = uuidv4();
    const languageCode = 'en-US';

    let context: any;
    let intentResponse: any;
    try {
        console.log(`Sending Query: ${query}`);
        intentResponse = await detectIntent(
            projectId,
            sessionId,
            query,
            context,
            languageCode
        );
        console.log('Detected intent');
        console.log(
            `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
        );
        context = intentResponse.queryResult.outputContexts;
        return intentResponse.queryResult.fulfillmentText;
    } catch (error) {
        console.log(error);
    }
}

router.post('/', (req, res) => {
    console.log(req.body);
    const jsonResponse = {
        fulfillmentText: 'This is from the replit webhook',
        source: 'webhook',
    };
    console.log((req as any).fulfillmentMessages[0].text.text[0]);
    res.send(jsonResponse);
});

router.head('/', (req, res) => {
    if (req.method === 'HEAD') {
        return res.sendStatus(200);
    }
});

export { router, executeQueries };
