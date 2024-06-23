import { Bot, 
    Context, session,
    type Conversation,
    type ConversationFlavor,
    conversations,
    createConversation,
    createClient,
 } from "./deps.deno.ts";

 const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

 type MyContext = Context & ConversationFlavor;
 type MyConversation = Conversation<MyContext>;

export const bot = new Bot<MyContext>(Deno.env.get("BOT_TOKEN") || "");

bot.use(session({ initial: () => ({}) }))
bot.use(conversations());

async function movie(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("How are you doing?");
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

bot.command("start", (ctx) => {
    // await   ctx.conversation.enter("movie");
    ctx.reply("Welcome! use /generate to get your token and connect your account to Hacker News et")
});

bot.command("generate", async(ctx) => {
 const id = ctx.from?.id;
  // generate a 23 character token
  const big_token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const token = big_token.substring(0, 21);
  // add database secret as a check for future  
  const {data, error} = await supabase.from("telegram_profiles").insert({
      tg_id: id,
      verf_token: token,
      tg_username: ctx.from?.username,
      first_name: ctx.from?.first_name,
      last_name: ctx.from?.last_name,
      is_public: false,
    });
    if (error) {
       console.log(error);
       ctx.reply("It seems you are already connected");
    } else {
      // reply with mark down 
      console.log(data)
      ctx.reply(`Here is your token: \`${token}\`\n\n Go to https://show.eacc.et/telegram and paste the token there`
      )
    }
})


bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`));