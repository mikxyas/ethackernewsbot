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
bot.use(session({initial: () => ({}) }));  

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



/** Defines the conversation */



bot.command('start', async(ctx) => {
  // ctx.reply('Welcome! Up and running.')
  await ctx.conversation.enter('movie')
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