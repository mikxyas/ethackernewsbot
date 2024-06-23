console.log(`Function "telegram-bot" up and running!`)
import { Bot, Context, session } from "./deps.deno.ts";
import {  webhookCallback } from './deps.deno.ts'
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations@v1.2.0/mod.ts";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>(Deno.env.get("BOT_TOKEN") || "");

bot.use(session({initial: () => ({})}));  
bot.use(conversations());

/** Defines the conversation */
async function greeting(conversation: MyConversation, ctx: MyContext) {

    await ctx.reply('Hello! What is your name?');
    const nameResponse = await conversation.wait();
    const name = nameResponse.message?.text;

    await ctx.reply(`Nice to meet you, ${name}! How old are you?`);
    const ageResponse = await conversation.wait();
    const age = ageResponse.message?.text;

    await ctx.reply(`Thank you, ${name}! I see you are ${age} years old.`);

}

bot.use(createConversation(greeting));

bot.command('start', async(ctx) => {
  ctx.reply('Welcome! Up and running.')
  await ctx.conversation.enter('greeting')
})

bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`))

const handleUpdate = webhookCallback(bot, 'std/http')

Deno.serve(async (req) => {

    const url = new URL(req.url)
    if (url.searchParams.get('secret') === Deno.env.get('FUNCTION_SECRET')) {
      try{
        return await handleUpdate(req)
        // return new Response('not allowed', { status: 405 })
      }catch(err){
        console.error(err)
      }
    }
    return new Response()
})