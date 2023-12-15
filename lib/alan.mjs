import { ensureString, need, throwError } from './utilitas.mjs';

const _NEED = [
    'OpenAI',
];

const [OPENAI] = ['OPENAI'];
const [name] = ['Alan'];
const openaiProvider = { provider: OPENAI };
const openaiProviderBeta = { ...openaiProvider, beta: true };
const openaiDefaultModel = 'gpt-4';

let openai;

const init = async (options) => {
    const provider = ensureString(options?.provider, { case: 'UP' });
    let client
    switch (provider) {
        case OPENAI:
            if (options?.apiKey) {
                const OpenAI = await need('openai');
                openai = new OpenAI(options);
            }
            client = options?.beta ? openai?.beta : openai;
            break;
        default:
            throwError(`Invalid AI provider: ${options?.provider || 'null'}`);
    }
    assert(client, 'AI engine has not been initialized.');
    return client;
};

const complete = async (content, options) => {
    const client = await init({ ...openaiProvider, ...options });
    // https://beta.openai.com/docs/api-reference/completions/create
    const resp = await client.chat.completions.create({
        messages: [...options?.messages || [], { role: 'user', content }],
        model: openaiDefaultModel,
        stream: !!options?.stream,
    });
    for await (const chunk of resp) {
        console.log(chunk);
        // process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
    // return options?.raw ? resp : resp.choices[0].message.content;
};

const createAssistant = async (options) => {
    const client = await init({ ...openaiProviderBeta, ...options });
    // https://platform.openai.com/docs/api-reference/assistants/createAssistant
    return await client.assistants.create({
        model: 'gpt-4', name, instructions: 'You are a helpful assistant.',
        tools: [
            { type: 'code_interpreter' },
            // { type: 'retrieval' },
            // { type: 'function' },
        ], ...options?.params || {},
        // description: null, file_ids: [], metadata: {},
    });
};

const listAssistant = async (options) => {
    const client = await init({ ...openaiProviderBeta, ...options });
    return (await client.assistants.list({
        order: 'asc', limit: '100', ...options?.params || {},
    })).data;
};

const ensureAssistant = async (options) => {
    const list = await listAssistant(options);
    return list.find(x => x.name === name) || await createAssistant(options);
};

const createThread = async (options) => {
    const client = await init({ ...openaiProviderBeta, ...options });
    // https://platform.openai.com/docs/api-reference/threads/createThread
    return await client.threads.create(options);
};

const getThread = async (threadId) => {
    const client = await init({ ...openaiProviderBeta, ...options });
    assert(threadId, 'Thread ID is required.', 400)
    // https://platform.openai.com/docs/api-reference/threads/getThread
    return await client.threads.retrieve(threadId);
};

const ensureThread = async opts => await (
    opts?.threadId ? getThread(opts?.threadId) : createThread(opts?.params)
);

const createMessage = async (threadId, message, options) => {
    const client = await init({ ...openaiProviderBeta, ...options });
    // https://platform.openai.com/docs/api-reference/messages/createMessage
    return await client.threads.messages.create(threadId, message);
};

const listMessages = async (threadId, options) => {
    const client = await init({ ...openaiProviderBeta, ...options });
    // https://platform.openai.com/docs/api-reference/messages/listMessages
    return JSON.stringify((await client.threads.messages.list(
        threadId, { limit: 1, ...options?.params || {} }
    )).data[0], null, 2);
};

const run = async (assistantId, threadId, options) => {
    const client = await init({ ...openaiProviderBeta, ...options });
    return await client.threads.runs.create(
        threadId,
        { assistant_id: assistantId }
    );
};

const getRun = async (threadId, runId, options) => {
    const client = await init({ ...openaiProviderBeta, ...options });
    return await client.threads.runs.retrieve(threadId, runId);
};

export default init;
export {
    _NEED,
    complete,
    createAssistant,
    createMessage,
    ensureAssistant,
    ensureThread,
    getRun,
    getThread,
    init,
    listAssistant,
    listMessages,
    run,
};
