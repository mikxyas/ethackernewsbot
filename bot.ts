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
    const post_link = await conversation.form.url();
    // if it is not valid url, ask the user to send a valid url
    if(!post_link){
        await ctx.reply("Please send a valid url");
        return;
    }
    // get the post id from the link and fetch the post the url looks like this https://show.eacc.et/post/1234
    const post_id = new URL(post_link).pathname.split("/")[2];

    const {data, error} = await supabase.from("posts").select("*").eq("id", post_id);
    if(error){
        console.log(error);
        await ctx.reply("Your post might not exist or there was an error fetching it");

    }else{
        console.log(data);
        // reply with the post with the title as the body and the url as an inline button at the bottom of the post 
        // make the url a string so that it can be used as a button
        const hackerNewsBot =  "https://t.me/acc_etbot/hackernews" + "?redirect_to=" + "/post/" + post_id;
        const keyboard = new InlineKeyboard().url("View Post", hackerNewsBot);
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