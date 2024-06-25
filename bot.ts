import { Bot, 
    Context, session,
    type Conversation,
    type ConversationFlavor,
    conversations,
    createConversation,
    createClient,
    InlineKeyboard,
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

async function getfancypost(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Send me the link to the Hacker News Post?");
    const link = await conversation.form.url;
    // get the post id from the link and fetch the post the url looks like this https://show.eacc.et/post/1234
    const post_id = link.split("/")[4];
    const {data, error} = await supabase.from("posts").select("*").eq("id", post_id);
    if(error){
        console.log(error);
        await ctx.reply("Your post might not exist or there was an error fetching it");

    }else{
        console.log(data);
        // reply with the post with the title as the body and the url as an inline button at the bottom of the post 
        const keyboard = new InlineKeyboard().url("View Post", link);
        await ctx.reply('Here is the post you requested 🗿')
        await ctx.reply(data[0].title, {reply_markup: keyboard});
    }
  }

bot.use(createConversation(getfancypost));

bot.command("start", (ctx) => {
    // await   ctx.conversation.enter("movie");
    ctx.reply("Hacker News Bot here 🗿\n open web app to explore")
});

bot.command("fancypost", async (ctx) => {
    await ctx.conversation.enter("getfancypost");
})



bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`));