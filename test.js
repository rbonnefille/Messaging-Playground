const axios = require("axios");
require("dotenv").config();

const botName = "Bugs Bunny";
const avatarUrl =
  "https://media.smooch.io/apps/6062e4fb75a38000d2988959/UmpgnbGvXG7vxipmVYt-iZ59/acme.png";

const author = {
  type: "business",
  displayName: botName,
  avatarUrl: avatarUrl
};

const activityBody = {
  author: author,
  type: "typing:start",
};

const messageBody = {
  author: author,
  content: {
    type: "text",
    text: "Test",
  },
};

// function to contrust the body of the request
function constructBody(message, image) {
    if(!image){    
        return Object.assign({
            author: author,
            content: {
            type: "text",
            text: message,
            },
        });
    } else {
        return Object.assign({
            author: author,
            content: {
            type: "image",
            mediaUrl: catImage,
            text: message
            },
        });
    }

function imageBody(catImage, message){
        return Object.assign({
            type: "image",
            mediaUrl: catImage,
            text: message
        });
    }

   

// function post request with axios
async function postRequest(messageType, appId, conversationId, suncoEndpoint) {
    if (messageType) {
        
    } else {
        
    }
    const body = constructBody()
    const url = `https://api.smooch.io/v2/apps/${appId}/conversations/${conversationId}/${suncoEndpoint}`;
    let response;
    try {
        response = await axios.post(url, constructBody, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUNCO_JWT}`,
        },
        });
    } catch (e) {
        // catch error
        throw new Error(e.message);
    }
    return response;
}

// postRequest(messageBody, "6062e4fb75a38000d2988959", "aca3cb7ac31ce17914df5c53", "messages");