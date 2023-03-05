import {
    ensureArray, ignoreErrFunc, insensitiveCompare, insensitiveHas, log as _log,
    need, prettyJson,
} from './utilitas.mjs';

import { isPrimary, on } from './callosum.mjs';
import { join } from 'path';
import { readdirSync } from 'fs';

const _NEED = ['telegraf']
const signals = ['SIGINT', 'SIGTERM'];
const cmpOpt = { w: true };
const iCmp = (strA, strB) => insensitiveCompare(strA, strB, cmpOpt);
const iHas = (list, str) => insensitiveHas(list, str, cmpOpt);
const log = (cnt, opt) => _log(cnt, import.meta.url, { time: 1, ...opt || {} });
const end = async (options) => bot && bot.stop(options?.signal);
const [BOT_SEND, provider, HELLO, GROUP, PRIVATE, CHANNEL, MENTION]
    = ['BOT_SEND', 'TELEGRAM', 'Hello!', 'group', 'private', 'channel', 'mention'];

let bot;

const questions = [{
    q: ['/THE THREE LAWS'],
    a: ['- A robot may not injure a human being or, through inaction, allow a human being to come to harm.',
        '- A robot must obey the orders given it by human beings except where such orders would conflict with the First Law.',
        '- A robot must protect its own existence as long as such protection does not conflict with the First or Second Laws.'].join('\n'),
}, {
    q: ['/The Ultimate Question of Life, the Universe, and Everything',
        '/The answer to life the universe and everything'],
    a: '42',
}];

// https://stackoverflow.com/questions/50204633/allow-bot-to-access-telegram-group-messages
const subconscious = [{
    run: true, name: 'subconscious', func: async (bot) => {
        bot.use(async (ctx, next) => {
            log(`Updated: ${ctx.update.update_id}`);
            process.stdout.write(`${JSON.stringify(ctx.update)}\n`);
            if (ctx.update.message) { ctx.type = 'message'; }
            else if (ctx.update.edited_message) { ctx.type = 'edited_message'; }
            else if (ctx.update.channel_post) { ctx.type = 'channel_post'; }
            else if (ctx.update.my_chat_member) { ctx.type = 'my_chat_member'; }
            else { log(`Unsupported update type.`); }
            switch (ctx.type) {
                case 'message': case 'edited_message': case 'channel_post':
                    ctx.chatId = ctx.update[ctx.type].chat.id;
                    ctx.chatType = ctx.update[ctx.type].chat.type;
                    ctx.end = !(ctx.text = ctx.update[ctx.type].text);
                    ctx.messageId = ctx.update[ctx.type].message_id;
                    if ((ctx.update[ctx.type].entities || []).some(
                        e => e.type === MENTION && ctx.text.substr(
                            ~~e.offset + 1, ~~e.length - 1
                        ) === bot.botInfo.username
                    )) {
                        if (!~~ctx.update[ctx.type].entities[0].offset) {
                            ctx.text = ctx.text.substr(
                                ~~ctx.update[ctx.type].entities[0].length + 1
                            );
                        }
                        ctx.chatType = MENTION;
                    }
                    break;
                case 'my_chat_member':
                    ctx.text = HELLO;
                    break;
                default:
                    ctx.end = true;
            }
            ctx.ok = (message, options) => ctx.done = ctx.replyWithMarkdown(message, {
                reply_to_message_id: ctx.chatType === PRIVATE ? undefined : ctx.messageId,
                ...options || {},
            });
            await next();
        });
    },
}, {
    run: true, name: 'laws', func: async (bot) => {
        bot.use(async (ctx, next) => {
            [...questions, {
                q: ['/echo'],
                a: ['```', prettyJson(ctx.update, { code: true }), '```'].join('\n'),
            }].map(s => s.q.map(
                x => iCmp(x, ctx.text) && (ctx.end = ctx.ok(s.a))
            ));
            await next();
        });
    },
}, {
    run: true, name: 'authenticate', func: async (bot) => {
        bot.private && bot.use(async (ctx, next) => {
            if ((ctx.end || (ctx.end = !iHas(bot.chatType, ctx.chatType)))) {
                return await next();
            }
            if (bot.magicWord && iHas(bot.magicWord, ctx.text)) {
                bot.private.add(String(ctx.chatId));
                ctx.ok('😸 You are now allowed to talk to me.');
                ctx.text = HELLO;
                return await next();
            }
            if (iHas(bot.private, ctx.chatId)
                || (ctx?.from && iHas(bot.private, ctx.from.id))) {
                return await next();
            }
            if (ctx.chatType !== PRIVATE && (
                await bot.telegram.getChatAdministrators(ctx.chatId)
            ).map(x => x.user.id).some(a => iHas(bot.private, a))) {
                return await next();
            }
            if (bot.homeGroup && iHas(['creator', 'administrator', 'member'], ( // 'left'
                await ignoreErrFunc(async () => await bot.telegram.getChatMember(bot.homeGroup, ctx.from.id))
            )?.status)) {
                return await next();
            }
            if (bot.auth && await bot.auth(ctx)) {
                return await next();
            }
            ctx.end = ctx.ok('😿 Sorry, I am not allowed to talk to strangers.');
            await next();
        });
    },
}, {
    run: true, name: 'ai', func: async (bot) => {
        bot.ai && bot.use(async (ctx, next) => {
            if (ctx.end || !ctx.text) { return await next(); }
            const multiEngine = (
                Array.isArray(bot.ai) ? bot.ai : Object.keys(bot.ai)
            ).length > 1;
            for (let name in bot.ai) {
                if (iCmp('/clear', ctx.text)) {
                    bot.ai[name].clear(ctx.chatId);
                    ctx.text = HELLO;
                }
                if (iCmp('/halt', ctx.text)) {
                    // https://nodejs.org/api/process.html#process_exit_codes
                    // @todo: only owner can halt
                    process.exit(128);
                }
                // (async () => { // disable async for `closure` check
                let resp;
                try {
                    resp = (await bot.ai[name].send(
                        ctx.text, { session: ctx.chatId }
                    )).responseRendered;
                } catch (err) { resp = `[ERROR] ${err?.message || err}`; log(err); }
                ctx.ok([
                    ...multiEngine && !Array.isArray(bot.ai) ? [`🤖️ ${name}`] : [],
                    resp, ...multiEngine ? ['---'] : [],
                ].join('\n\n'));
                // })();
            }
            await next();
        });
    },
}, {
    run: true, name: 'closure', func: async (bot) => {
        bot.use(async (ctx, next) => {
            ctx.done || log('Missing response.');
            await next();
        });
    },
}];

const train = async (bot, func, name, options) => {
    log(`Training: ${name = name || uuidv4()}`, { force: true });
    return await func(bot);
};

const load = async (bot, module, options) => {
    assert(module && module.func, 'Skill function is required.', 500);
    return await train(bot, module.func, module.name, options);
};

const init = async (options) => {
    if (options) {
        assert(
            insensitiveCompare(options?.provider, provider),
            'Invalid bot provider.', 501
        );
        if (isPrimary) {
            // https://github.com/telegraf/telegraf
            const { Telegraf } = await need('telegraf', { raw: true });
            // https://github.com/telegraf/telegraf/issues/1736
            const { useNewReplies } = await need('telegraf/future', { raw: true });
            bot = new Telegraf(options?.botToken);
            bot.auth = Function.isFunction(options?.auth) && options.auth;
            bot.homeGroup = options?.homeGroup;
            bot.magicWord = options?.magicWord && new Set(options.magicWord);
            bot.private = options?.private && new Set(options.private);
            bot.ai = options?.ai; // Should be an array of a map of AIs.
            // ignore GROUP, CHANNEL by default
            bot.use(useNewReplies());
            bot.chatType = new Set(options?.chatType || ['mention', PRIVATE]);
            const [mods, pmsTrain] = [[
                ...subconscious.map(s => ({ ...s, run: !options?.silent })),
                ...ensureArray(options?.skill),
            ], []];
            for (let skillPath of ensureArray(options?.skillPath)) {
                log(`SKILLS: ${skillPath}`);
                const files = (readdirSync(skillPath) || []).filter(
                    file => /\.mjs$/i.test(file) && !file.startsWith('.')
                );
                for (let f of files) {
                    const m = await import(join(skillPath, f));
                    mods.push({ ...m, name: m.name || f.replace(/^(.*)\.mjs$/i, '$1') });
                }
            }
            mods.map(mod => { mod.run && pmsTrain.push(load(bot, mod, options)) });
            assert(pmsTrain.length, 'Invalid skill set.', 501);
            await Promise.all(pmsTrain);
            bot.launch();
            on(BOT_SEND, (data) => send(...data || []));
            // Graceful stop
            signals.map(signal => process.once(signal, () => bot.stop(signal)));
        } else {
            bot = {
                telegram: {
                    sendMessage: (...args) =>
                        process.send({ action: BOT_SEND, data: args })
                }
            };
        }
    }
    assert(bot, 'Bot have not been initialized.', 501);
    return bot;
};

const send = async (chatId, content, options) =>
    (await init()).telegram.sendMessage(chatId, content);

export default init;
export {
    _NEED,
    end,
    init,
    send,
};
