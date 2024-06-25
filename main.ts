console.log(`Function "telegram-bot" up and running!`)

import {bot} from './bot.ts'

import {  webhookCallback } from './deps.deno.ts'

const handleUpdate = webhookCallback(bot, 'std/http')

Deno.serve(async (req) => {

    const url = new URL(req.url)
    if (url.searchParams.get('secret') === Deno.env.get('FUNCTION_SECRET')) {
      try{
        return await handleUpdate(req)

      }catch(err){
        console.error(err)
      }
    }
    return new Response()
})