import {
    ensureString, log as _log, renderText as _renderText, throwError
} from "./utilitas.mjs";

const _NEED = ['@waylaidwanderer/chatgpt-api'];
const renderText = (t, o) => _renderText(t, { extraCodeBlock: 1, ...o || {} });
const log = (content) => _log(content, import.meta.url);

const init = async (options) => {
    const sessions = {};
    let provider, engine, client;
    switch ((provider = ensureString(options?.provider, { case: 'UP' }))) {
        case 'BING':
            // https://github.com/waylaidwanderer/node-chatgpt-api/blob/main/demos/use-bing-client.js
            engine = (await import('@waylaidwanderer/chatgpt-api')).BingAIClient;
            client = new engine(options?.clientOptions);
            break;
        case 'CHATGPT':
            // https://github.com/waylaidwanderer/node-chatgpt-api/blob/main/demos/use-client.js
            // Throttled: Request is throttled.
            // https://github.com/waylaidwanderer/node-chatgpt-api/issues/96
            engine = (await import('@waylaidwanderer/chatgpt-api')).ChatGPTClient;
            client = new engine(options?.clientOptions?.apiKey, {
                modelOptions: {
                    model: 'gpt-3.5-turbo',
                    ...options?.clientOptions?.modelOptions || {}
                }, ...options?.clientOptions || {}
            }, options?.cacheOptions);
            break;
        default:
            throwError('Invalid AI provider.', 500);
    }
    const send = async (message, options) => {
        const _session = options?.session || '_';
        try {
            sessions[_session] = await client.sendMessage(message, {
                toneStyle: 'balanced', // or creative, precise
                clientId: sessions?.[_session]?.clientId,
                conversationId: sessions?.[_session]?.conversationId,
                conversationSignature: sessions?.[_session]?.conversationSignature,
                invocationId: sessions?.[_session]?.invocationId,
                parentMessageId: sessions?.[_session]?.messageId,
                ...options || {},
            });
        } catch (err) {
            log(err);
            sessions[_session] = null;
            throwError(err?.message || err, 500);
        }
        sessions[_session].responseRendered = renderText(
            sessions[_session].response
        );
        const cards = (
            sessions[_session]?.details?.adaptiveCards || []
        )[0]?.body[0].text.split('\n\n').slice(0, -1);
        if (cards?.length) {
            sessions[_session].responseRendered += `\n\n***\nLearn more:\n${cards[0]}`;
        }
        const sources = sessions[_session]?.details?.sourceAttributions || [];
        if (sources.length) {
            sessions[_session].responseRendered += `\n\n***\nSource:`;
        }
        for (let i in sources) {
            sessions[_session].responseRendered
                += `\n${~~i + 1}. [${sources[i].providerDisplayName}](${sources[i].seeMoreUrl})`;
        }
        return sessions[_session];
    };
    return { engine, client, send };
};

export default init;
export {
    _NEED,
    init,
};
