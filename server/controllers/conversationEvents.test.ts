import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import type { Request, Response } from 'express';
import messageEvents from './conversationEvents.js';
import ConversationEvent from '../models/webhook.js';
import SunCoClient from '../utils/suncoApi.js';

const authenticate = ConversationEvent.prototype.isAuthenticatedRequest;

const createRequest = (
    payload: Record<string, unknown> = {},
    type = 'conversation:create'
): Request =>
    ({
        headers: { 'x-api-key': 'test-webhook-secret' },
        body: {
            app: { id: 'app-1' },
            webhook: { id: 'webhook-1', version: 'v2' },
            events: [
                {
                    id: 'event-1',
                    createdAt: '2026-10-15T09:00:00.000Z',
                    type,
                    payload: {
                        conversation: {
                            id: 'conversation-1',
                            type: 'personal',
                            activeSwitchboardIntegration: {
                                id: 'other-integration',
                            },
                        },
                        user: {
                            id: '6ac77cf55bc6b2bab634e704',
                            externalId: 'external-user',
                        },
                        creationReason: 'prechatCapture',
                        source: { type: 'web' },
                        ...payload,
                    },
                },
            ],
        },
    }) as unknown as Request;

const createResponse = () => {
    const state = { status: 200, ended: false, body: undefined as unknown };
    const response = {
        sendStatus(status: number) {
            state.status = status;
            return response;
        },
        status(status: number) {
            state.status = status;
            return response;
        },
        json(body: unknown) {
            state.body = body;
            state.ended = true;
            return response;
        },
        end() {
            state.ended = true;
            return response;
        },
    } as unknown as Response;
    return { response, state };
};

beforeEach(() => {
    mock.method(
        ConversationEvent.prototype,
        'isAuthenticatedRequest',
        () => true
    );
    // Metadata is updated even when bot replies are suppressed by switchboard control.
    mock.method(
        ConversationEvent.prototype,
        'isCurrentSwitchboardIntegration',
        () => false
    );
    mock.method(console, 'warn', () => {});
    mock.method(console, 'error', () => {});
});

afterEach(() => mock.restoreAll());

test('patches authenticated create events with the internal user ID before checking bot control', async () => {
    const calls: string[][] = [];
    mock.method(
        SunCoClient.prototype,
        'setConversationUserId',
        async (conversationId: string, userId: string) => {
            calls.push([conversationId, userId]);
        }
    );
    const { response, state } = createResponse();

    await messageEvents(createRequest(), response, () => {});

    assert.deepEqual(calls, [['conversation-1', '6ac77cf55bc6b2bab634e704']]);
    assert.equal(state.status, 200);
    assert.equal(state.ended, true);
});

test('waits for the metadata patch before acknowledging the create event', async () => {
    let finishPatch: () => void = () => {};
    const patch = new Promise<void>((resolve) => {
        finishPatch = resolve;
    });
    mock.method(SunCoClient.prototype, 'setConversationUserId', () => patch);
    const { response, state } = createResponse();

    const handled = messageEvents(createRequest(), response, () => {});
    assert.equal(state.ended, false);
    finishPatch();
    await handled;
    assert.equal(state.ended, true);
});

test('does not patch unauthenticated events', async () => {
    mock.method(
        ConversationEvent.prototype,
        'isAuthenticatedRequest',
        () => false
    );
    const update = mock.method(
        SunCoClient.prototype,
        'setConversationUserId',
        async () => {}
    );
    const { response, state } = createResponse();

    await messageEvents(createRequest(), response, () => {});

    assert.equal(update.mock.callCount(), 0);
    assert.equal(state.status, 401);
});

test('does not patch message, postback, or read events', async () => {
    const update = mock.method(
        SunCoClient.prototype,
        'setConversationUserId',
        async () => {}
    );

    for (const type of [
        'conversation:message',
        'conversation:postback',
        'conversation:read',
    ]) {
        const { response, state } = createResponse();
        await messageEvents(createRequest({}, type), response, () => {});
        assert.equal(state.status, 200);
        assert.equal(state.ended, true);
    }

    assert.equal(update.mock.callCount(), 0);
});

test('skips create metadata updates when either ID is missing', async () => {
    const update = mock.method(
        SunCoClient.prototype,
        'setConversationUserId',
        async () => {}
    );

    for (const payload of [{ user: undefined }, { conversation: undefined }]) {
        const { response, state } = createResponse();
        await messageEvents(createRequest(payload), response, () => {});
        assert.equal(state.status, 200);
        assert.equal(state.ended, true);
    }

    assert.equal(update.mock.callCount(), 0);
});

test('returns a retryable error when the metadata update fails', async () => {
    mock.method(SunCoClient.prototype, 'setConversationUserId', async () => {
        throw new Error('Upstream unavailable');
    });
    const { response, state } = createResponse();

    await messageEvents(createRequest(), response, () => {});

    assert.equal(state.status, 502);
    assert.equal(state.ended, true);
    assert.deepEqual(state.body, {
        error: 'Unable to set conversation user metadata',
    });
});

test('authentication never accepts a missing or empty secret header', () => {
    const event = new ConversationEvent(createRequest());
    assert.equal(authenticate.call(event, undefined), false);
    assert.equal(authenticate.call(event, ''), false);
});
