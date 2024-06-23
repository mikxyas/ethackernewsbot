import { Bot, 
    Context, session,
    type Conversation,
    type ConversationFlavor,
    conversations,
    createConversation,
 } from "./deps.deno.ts";

 type MyContext = Context & ConversationFlavor;
 type MyConversation = Conversation<MyContext>;

export const bot = new Bot<MyContext>(Deno.env.get("BOT_TOKEN") || "");

bot.use(session({ initial: () => ({}) }))
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

bot.command("start", async(ctx) => {
    await   ctx.conversation.enter("movie");
    // ctx.reply("Welcome! Up and running.")

});

bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`));