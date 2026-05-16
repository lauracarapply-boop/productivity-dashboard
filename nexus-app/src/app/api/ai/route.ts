import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const { action, payload } = await req.json()

  try {
    switch (action) {
      case 'extract': {
        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `Extract structured items from the following text. Return ONLY valid JSON matching this exact schema, no markdown, no explanation:
{
  "tasks": [{"title": string, "priority": "urgent"|"high"|"medium"|"low", "status": "todo"}],
  "events": [{"title": string, "type": "class"|"study"|"meeting"|"deadline"|"personal"}],
  "deadlines": [{"title": string, "date": "YYYY-MM-DD"}],
  "notes": [{"title": string, "content": string}],
  "suggested_course": string | null,
  "confidence": number
}

Text to extract from:
${payload.text}`,
          }],
        })
        const raw = (message.content[0] as { type: string; text: string }).text.trim()
        const json = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''))
        return NextResponse.json(json)
      }

      case 'parse_email': {
        const today = new Date().toISOString().split('T')[0]
        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          messages: [{
            role: 'user',
            content: `Parse the following email and extract any calendar event details. Today is ${today}. Return ONLY valid JSON, no markdown:
{
  "title": string,
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "location": string,
  "description": string,
  "type": "class"|"study"|"meeting"|"deadline"|"appointment"|"personal",
  "confidence": number (0-1)
}

Email:
${payload.email}`,
          }],
        })
        const raw = (message.content[0] as { type: string; text: string }).text.trim()
        const json = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''))
        return NextResponse.json(json)
      }

      case 'summarize_note': {
        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 768,
          messages: [{
            role: 'user',
            content: `Analyze this note and return ONLY valid JSON, no markdown:
{
  "summary": string (2-3 sentences),
  "key_concepts": string[] (3-5 items),
  "possible_tasks": string[] (2-3 items),
  "possible_flashcards": [{"front": string, "back": string}] (2-3 items)
}

Note:
${payload.content}`,
          }],
        })
        const raw = (message.content[0] as { type: string; text: string }).text.trim()
        const json = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''))
        return NextResponse.json(json)
      }

      case 'classify_file': {
        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          messages: [{
            role: 'user',
            content: `Classify this Google Drive file and return ONLY valid JSON, no markdown:
{
  "detected_type": "syllabus"|"assignment"|"notes"|"reading"|"slides"|"general",
  "summary": string,
  "detected_tasks": string[],
  "detected_deadlines": string[],
  "confidence": number (0-1)
}

File name: ${payload.name}
MIME type: ${payload.mimeType ?? 'unknown'}
Content excerpt: ${payload.content ?? 'not available'}`,
          }],
        })
        const raw = (message.content[0] as { type: string; text: string }).text.trim()
        const json = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''))
        return NextResponse.json(json)
      }

      case 'task_breakdown': {
        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          messages: [{
            role: 'user',
            content: `Break down this task into actionable subtasks with time estimates. Return ONLY valid JSON, no markdown:
{
  "subtasks": [{"title": string, "estimated_minutes": number}]
}
Give 3-6 concrete subtasks.

Task: ${payload.title}
Description: ${payload.description ?? ''}`,
          }],
        })
        const raw = (message.content[0] as { type: string; text: string }).text.trim()
        const json = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''))
        return NextResponse.json(json)
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    console.error('AI route error:', err)
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
  }
}
