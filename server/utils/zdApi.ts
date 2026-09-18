import axios, { type AxiosError } from 'axios';

const {
    ZD_SUBDOMAIN: subdomain,
    ZD_USERNAME: username,
    ZD_PASSWORD: password,
} = process.env;

const auth = { username, password } as { username: string; password: string };

const zendeskBaseUrl = `https://${subdomain}.zendesk.com/api/v2`;

interface ZdUser {
    external_id: string;
    email: string;
    name: string;
    skip_verify_email?: boolean;
    notes?: string;
}

interface SearchUserQuery {
    email?: string;
    external_id?: string;
}

interface SearchUserResponse {
    users: Array<{ id: string | number; external_id?: string }>;
}

export const syncUser = async (
    email: string,
    external_id: string,
    name: string
): Promise<void> => {
    const user: ZdUser = {
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

    if (
        foundByEmail.users.length === 0 ||
        (foundByEmail.users.length > 0 && !foundByEmail.users[0].external_id)
    ) {
        return await createOrUpdateUser(user);
    }
};

const searchUser = async (user: SearchUserQuery): Promise<SearchUserResponse> => {
    let searchUrl: string;
    if (user.email)
        searchUrl = `${zendeskBaseUrl}/users/search?query=email:${user.email}&include=identities`;
    else
        searchUrl = `${zendeskBaseUrl}/users/search?external_id=${user.external_id}&include=identities`;
    console.log(searchUrl);
    try {
        const response = await axios.get(searchUrl, { auth: auth });
        return response.data;
    } catch (e) {
        console.error('Error fetching user:', e);
        throw new Error(
            (e as AxiosError).response?.statusText ?? 'request failed'
        );
    }
};

const createOrUpdateUser = async (
    user: ZdUser,
    skipVerification = true
): Promise<void> => {
    user.skip_verify_email = skipVerification;
    user.notes = `Via API on ${new Date().toLocaleString()}`;
    const body = {
        user: user,
    };
    console.log(body);
    const config = {
        method: 'POST' as const,
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
        throw new Error(
            (e as AxiosError).response?.statusText ?? 'request failed'
        );
    }
};
