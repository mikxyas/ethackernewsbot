console.log(`Function "telegram-bot" up and running!`);

import { Bot, Context, session } from "./deps.deno.ts";
import { webhookCallback } from './deps.deno.ts';
import {
  Conversation,
  ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations@v1.2.0/mod.ts";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

// Ensure BOT_TOKEN is set
const botToken = Deno.env.get("BOT_TOKEN");
if (!botToken) {
  throw new Error("BOT_TOKEN environment variable is not set");
}

const bot = new Bot<MyContext>(botToken);
bot.use(session({ initial: () => ({}) }));

bot.use(conversations());

async function movie(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("How many favorite movies do you have?");
  const count = await conversation.form.number();
  const movies: string[] = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Tell me number ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Here is a better ranking!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}

bot.use(createConversation(movie));

bot.command('start', async (ctx) =>  await ctx.conversation.enter('movie'));

bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`));

const handleUpdate = webhookCallback(bot, 'std/http');

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const functionSecret = Deno.env.get('FUNCTION_SECRET');
  if (!functionSecret) {
    console.error("FUNCTION_SECRET environment variable is not set");
    return new Response('Server configuration error', { status: 500 });
  }

  if (url.searchParams.get('secret') === functionSecret) {
    try {
      return await handleUpdate(req);
    } catch (err) {
      console.error("Error handling update:", err);
      return new Response('Internal server error', { status: 500 });
    }
  }

  return new Response('Not allowed', { status: 405 });
});
