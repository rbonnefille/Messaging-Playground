import { v4 as uuidv4 } from "uuid";
import dialogflow from "@google-cloud/dialogflow";

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();
const projectId = "sunco-bxgh";
const sessionId = uuidv4;
const languageCode = "en-US";

async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode
) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
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
// async function executeQueries(projectId, sessionId, query, languageCode) {

const executeQueries = async (query) => {
  const projectId = "sunco-bxgh";
  const sessionId = uuid.v4();
  const languageCode = "en-US";

  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  let context;
  let intentResponse;
  try {
    console.log(`Sending Query: ${query}`);
    intentResponse = await detectIntent(
      projectId,
      sessionId,
      query,
      context,
      languageCode
    );
    console.log("Detected intent");
    console.log(
      `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
    );
    // Use the context from this response for next queries
    context = intentResponse.queryResult.outputContexts;
    return intentResponse.queryResult.fulfillmentText;
  } catch (error) {
    console.log(error);
  }
};

export default executeQueries;
