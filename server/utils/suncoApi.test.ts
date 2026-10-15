import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import axios, {
    AxiosError,
    type AxiosAdapter,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
import SunCoClient, { isApiSuccess } from './suncoApi.js';

const createAxios = axios.create.bind(axios);

const apiResponse = (
    config: InternalAxiosRequestConfig,
    data: unknown,
    status = 200
): AxiosResponse<unknown> => ({
    config,
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
});

const createClient = (adapter: AxiosAdapter): SunCoClient => {
    const api = createAxios({ adapter });
    mock.method(axios, 'create', () => api);
    return new SunCoClient();
};

afterEach(() => mock.restoreAll());

test('resolves string, user ID, and external ID identifiers', () => {
    const client = createClient(async (config) => apiResponse(config, {}));
    assert.equal(client.getUserIdOrExternalId('customer'), 'customer');
    assert.equal(client.getUserIdOrExternalId({ userId: 'user-1' }), 'user-1');
    assert.equal(
        client.getUserIdOrExternalId({ externalId: 'customer' }),
        'customer'
    );
    assert.equal(
        client.getUserIdOrExternalId({ userId: 'user-1', externalId: 'customer' }),
        'user-1'
    );
});

test('rejects missing identifiers before making an API request', async () => {
    let requests = 0;
    const client = createClient(async (config) => {
        requests++;
        return apiResponse(config, {});
    });

    assert.throws(() => client.getUserIdOrExternalId({}), /user ID or external ID/);
    await assert.rejects(client.getUser({ userId: undefined }), /user ID or external ID/);
    assert.equal(requests, 0);
});

test('distinguishes successful read responses from existing error values', () => {
    assert.equal(isApiSuccess({ user: { id: 'user-1' } }), true);
    assert.equal(isApiSuccess('Not found'), false);
    assert.equal(isApiSuccess(404), false);
    assert.equal(isApiSuccess(undefined), false);
});

test('preserves user response data and encodes the user identifier', async () => {
    const data = { user: { id: 'user-1', metadata: { subscribed: true } } };
    const client = createClient(async (config) => {
        assert.ok(config.url?.endsWith('/users/customer%2F42'));
        return apiResponse(config, data);
    });

    const result = await client.getUser({ externalId: 'customer/42' });
    assert.ok(isApiSuccess(result));
    assert.equal(result.user.metadata?.subscribed, true);
    assert.deepEqual(result, data);
});

test('collects all conversation pages and preserves final-page metadata', async () => {
    let requests = 0;
    const client = createClient(async (config) => {
        const params = config.params as Record<string, unknown>;
        assert.equal(params['filter[userExternalId]'], 'customer');
        assert.equal(params['page[size]'], 100);
        requests++;

        if (requests === 1) {
            assert.equal(params['page[after]'], undefined);
            return apiResponse(config, {
                conversations: [{ id: 'conversation-1' }],
                meta: { hasMore: true, afterCursor: 'next-page' },
            });
        }

        assert.equal(params['page[after]'], 'next-page');
        return apiResponse(config, {
            conversations: [{ id: 'conversation-2' }],
            meta: { hasMore: false },
            links: { previous: 'previous-page' },
        });
    });

    const result = await client.listConversations({ externalId: 'customer' });
    assert.ok(isApiSuccess(result));
    assert.deepEqual(result.conversations.map((conversation) => conversation.id), [
        'conversation-1',
        'conversation-2',
    ]);
    assert.deepEqual(result.meta, { hasMore: false });
    assert.deepEqual(result.links, { previous: 'previous-page' });
    assert.equal(requests, 2);
});

test('keeps the existing user ID filter for 24-character identifiers', async () => {
    const userId = '0123456789abcdef01234567';
    const client = createClient(async (config) => {
        const params = config.params as Record<string, unknown>;
        assert.equal(params['filter[userId]'], userId);
        assert.equal(params['filter[userExternalId]'], undefined);
        return apiResponse(config, { conversations: [] });
    });

    const result = await client.listConversations(userId);
    assert.ok(isApiSuccess(result));
    assert.deepEqual(result.conversations, []);
});

test('preserves upstream error titles and HTTP-status fallbacks', async () => {
    const client = createClient(async (config) => {
        const data = config.url?.endsWith('/users/missing')
            ? { errors: [{ title: 'User not found' }] }
            : {};
        throw new AxiosError(
            'Request failed',
            'ERR_BAD_REQUEST',
            config,
            undefined,
            apiResponse(config, data, 404)
        );
    });

    const missingUser = await client.getUser('missing');
    assert.equal(missingUser, 'User not found');
    assert.equal(isApiSuccess(missingUser), false);
    assert.equal(await client.getConversation('missing'), 404);
});

test('reports a missing pagination cursor without requesting another page', async () => {
    let requests = 0;
    const client = createClient(async (config) => {
        requests++;
        return apiResponse(config, {
            conversations: [],
            meta: { hasMore: true },
        });
    });

    assert.equal(
        await client.listConversations('customer'),
        'Missing conversation pagination cursor'
    );
    assert.equal(requests, 1);
});

test('sets conversation user metadata while preserving existing metadata', async () => {
    const requests: string[] = [];
    const metadata = { ticketStatus: 'open', priority: 'high', userId: 'old-user' };
    const client = createClient(async (config) => {
        requests.push(config.method ?? '');
        assert.ok(config.url?.endsWith('/conversations/conversation%2F1'));
        assert.equal(config.timeout, 5000);

        if (config.method === 'get') {
            return apiResponse(config, {
                conversation: { id: 'conversation/1', displayName: 'Keep this name', metadata },
            });
        }

        assert.deepEqual(JSON.parse(String(config.data)), {
            metadata: { ...metadata, userId: 'user-1' },
        });
        return apiResponse(config, {});
    });

    await client.setConversationUserId('conversation/1', 'user-1');
    assert.deepEqual(requests, ['get', 'patch']);
    assert.equal(metadata.userId, 'old-user');
});

test('does not patch again when conversation metadata already has the user ID', async () => {
    let patches = 0;
    let metadata: Record<string, unknown> = { ticketStatus: 'open' };
    const client = createClient(async (config) => {
        if (config.method === 'patch') {
            patches++;
            metadata = JSON.parse(String(config.data)).metadata;
        }
        return apiResponse(config, {
            conversation: { id: 'conversation-1', metadata },
        });
    });

    await client.setConversationUserId('conversation-1', 'user-1');
    await client.setConversationUserId('conversation-1', 'user-1');
    assert.equal(patches, 1);
    assert.deepEqual(metadata, { ticketStatus: 'open', userId: 'user-1' });
});

test('sets user metadata when existing metadata is absent or null', async () => {
    for (const metadata of [undefined, null]) {
        let patches = 0;
        const client = createClient(async (config) => {
            if (config.method === 'patch') {
                patches++;
                assert.deepEqual(JSON.parse(String(config.data)), {
                    metadata: { userId: 'user-1' },
                });
            }
            return apiResponse(config, {
                conversation: { id: 'conversation-1', metadata },
            });
        });

        await client.setConversationUserId('conversation-1', 'user-1');
        assert.equal(patches, 1);
    }
});

test('propagates metadata read failures without patching the conversation', async () => {
    let requests = 0;
    const client = createClient(async () => {
        requests++;
        throw new Error('Metadata read failed');
    });

    await assert.rejects(
        client.setConversationUserId('conversation-1', 'user-1'),
        /Metadata read failed/
    );
    assert.equal(requests, 1);
});

test('propagates conversation metadata patch failures', async () => {
    const client = createClient(async (config) => {
        if (config.method === 'patch') throw new Error('Metadata patch failed');
        return apiResponse(config, { conversation: { id: 'conversation-1' } });
    });

    await assert.rejects(
        client.setConversationUserId('conversation-1', 'user-1'),
        /Metadata patch failed/
    );
});

test('rejects missing conversation or user IDs before reading metadata', async () => {
    let requests = 0;
    const client = createClient(async (config) => {
        requests++;
        return apiResponse(config, {});
    });

    await assert.rejects(client.setConversationUserId('', 'user-1'), /required/);
    await assert.rejects(client.setConversationUserId('conversation-1', ''), /required/);
    assert.equal(requests, 0);
});

test('stops repeated pagination cursors instead of looping', async () => {
    let requests = 0;
    const client = createClient(async (config) => {
        requests++;
        return apiResponse(config, {
            conversations: [],
            meta: { hasMore: true, afterCursor: 'same-cursor' },
        });
    });

    assert.equal(
        await client.listConversations('customer'),
        'Repeated conversation pagination cursor'
    );
    assert.equal(requests, 2);
});
