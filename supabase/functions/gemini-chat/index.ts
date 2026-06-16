import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Verify user is authenticated
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return new Response('Unauthorized', { status: 401 })

  // Get request body
  const { messages, meridianState } = await req.json()

  // Build system prompt with full Meridian state
  const systemPrompt = `You are Meridian's AI assistant for ${user.email}. 
Today is ${new Date().toDateString()}.
Current Meridian state: ${JSON.stringify(meridianState)}

You can answer questions about workload, suggest priorities, and modify data by returning a JSON action block:
\`\`\`json
{ "action": "add_deliverable", "data": { ... } }
\`\`\`
Supported actions: add_deliverable, update_deliverable, add_pipeline_item, update_pipeline_item, add_content_piece, update_content_piece`

  // Call Gemini
  const geminiKey = Deno.env.get('GEMINI_API_KEY')
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messages
      })
    }
  )
  const geminiData = await response.json()
  return new Response(JSON.stringify(geminiData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
