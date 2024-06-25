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
function escapeMarkdown(text: string) {
  if(!text) return "";
  // return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

}
async function getfancypost(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("Send me the link to the Hacker News Post?");
    const post_link = await conversation.form.url();
    if(!post_link){
        await ctx.reply("Please send a valid url");
        return;
    }
    const post_id = new URL(post_link).pathname.split("/")[2];

    const {data, error} = await supabase.from("posts").select("*").eq("id", post_id);
    if(error){
        console.log(error);
        await ctx.reply("Your post might not exist or there was an error fetching it");

    }else{
        const hackerNewsBot =  "https://t.me/acc_etbot/hackernews" + "?startapp=" +  post_id;
        const keyboard = new InlineKeyboard().url("View Post", hackerNewsBot);
        await ctx.reply('Here is your card 🗿')
        const title = escapeMarkdown(data[0].title);
        const about = escapeMarkdown(data[0].text || "")
        await ctx.reply(`__${title}__</b>\n\n${about}`, {reply_markup: keyboard, parse_mode:'MarkdownV2'});
    }
  }

bot.use(createConversation(getfancypost));

bot.command("start", (ctx) => {
    ctx.reply("Hacker News Bot 🗿\n use /fancypost to get a fancy post card of your post in hacker news to share in telegram")
});

bot.command("fancypost", async (ctx) => {
    await ctx.conversation.enter("getfancypost");
})

bot.command("ping", (ctx) => ctx.reply(`DONG 🗿`));