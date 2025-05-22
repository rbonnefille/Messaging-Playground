import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const {
    ZD_SUBDOMAIN: subdomain,
    ZD_USERNAME: username,
    ZD_PASSWORD: password,
} = process.env;

const auth = {
    username: username,
    password: password,
};

const zendeskBaseUrl = `https://${subdomain}.zendesk.com/api/v2`;

export const syncUser = async (email, external_id, name) => {
    const user = {
        external_id: external_id,
        email: email.toLowerCase(),
        name: name,
    };
    console.log(`User to find - ${JSON.stringify(user, null, 2)}`);

    const foundByEmail = await searchUser({ email: email });
    console.log(
        `----------------------------------------Found by Email---------------------------------------- \n
    ${foundByEmail} \n`
    );

    if (
        foundByEmail.users.length > 0 &&
        foundByEmail.users[0].external_id === external_id
    )
        return;

    const foundByExternalId = await searchUser({ external_id: external_id });

    console.log(
        `----------------------------------------Found by Ext. ID---------------------------------------- \n
    ${foundByExternalId} \n}`
    );

    // if this is true there is a problem (1 existing user matches email, another matches external ID)
    if (
        foundByEmail.users.length > 0 &&
        foundByExternalId.users.length > 0 &&
        foundByEmail.users[0].id !== foundByExternalId.users[0].id
    ) {
        console.log(`----------------------------------------Error---------------------------------------- \n
    foundByEmail - ${JSON.stringify(foundByEmail.users[0], null, 2)} \n
    foundByExternalId - ${JSON.stringify(
        foundByExternalId.users[0],
        null,
        2
    )} \n`);
    }

    // update external_id on user found by email, or email on user found by external_id , or create new user is none was found
    if (
        foundByEmail.users.length === 0 ||
        (foundByEmail.users.length > 0 && !foundByEmail.users[0].external_id)
    ) {
        return await createOrUpdateUser(user);
    }
};

const searchUser = async (user) => {
    let searchUrl = String;
    if (user.email)
        searchUrl = `${zendeskBaseUrl}/users/search?query=email:${user.email}&include=identities`;
    else
        searchUrl = `${zendeskBaseUrl}/users/search?external_id=${user.external_id}&include=identities`;
    console.log(searchUrl);
    try {
        const response = await axios.get(searchUrl, { auth: auth });
        return response.data;
    } catch (e) {
        console.error('Error fetching user:', error);
        throw new Error(e.response.statusText);
    }
};

const createOrUpdateUser = async (user, skipVerification = true) => {
    user.skip_verify_email = skipVerification;
    user.notes = `Via API on ${new Date().toLocaleString()}`;
    const body = {
        user: user,
    };
    console.log(body);
    const config = {
        method: 'POST',
        url: `${zendeskBaseUrl}/users/create_or_update`,
        data: body,
        headers: {
            'Content-Type': 'application/json',
        },
        auth: auth,
    };
    try {
        const response = await axios.request(config);
        console.log(`----------------------------------------Create or Update User in Zendesk---------------------------------------- \n
          ${JSON.stringify(response.data, null, 2)} \n`);
    } catch (e) {
        // catch error
        throw new Error(e.response.statusText);
    }
};
