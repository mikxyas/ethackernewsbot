console.log(`Function "telegram-bot" up and running!`)

import {bot} from './bot.ts'

import {  webhookCallback } from './deps.deno.ts'

// bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))

// bot.command('ping', (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`))

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