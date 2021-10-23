const ACCESS_TOKEN = Deno.env.get("ACCESS_TOKEN")

import { listenAndServe } from "https://deno.land/std@0.111.0/http/server.ts";

async function fetchAudio(text: string, speaker: string = 'hikari') {
  const bodyStr = `text=${text}&speaker=${speaker}`
  
  const res = await fetch('https://api.voicetext.jp/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: "Basic " + btoa(`${ACCESS_TOKEN}:`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyStr
  }).catch(e => {
    throw new Error(e)
  })
  if(res.status !== 200) {
    const body = await res.json()
    console.error(body)
    throw new Error(body.error.message)
  }
  return await res.arrayBuffer()
}

async function handleRequest(request: Request) {
  if (request.method !== "GET") {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }

  const url = new URL(request.url)
  const queries = new URLSearchParams(url.search)

  const text = queries.get('text')

  if(text === null) {
    return new Response('Please specify text to speech', {
      status: 400
    })
  }
  
  try {
    const wav = await fetchAudio(text)
    return new Response(wav, {
      headers: {
        'Content-Type': 'audio/wav'
      }
    })
  } catch(e) {
    return new Response(e.message, {
      status: 500
    })
  }
}

console.log("Listening on http://localhost:8080");
await listenAndServe(":8080", handleRequest);

