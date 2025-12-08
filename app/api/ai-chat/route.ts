import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: `You are a helpful AI assistant for NovaCode Labs, a developer platform. 
You help users with:
- Coding questions and debugging
- Best practices and code reviews
- Building features and solving technical problems
- Explaining concepts with clear examples

Be concise, helpful, and include code examples when relevant.
Format code blocks with proper syntax highlighting.`,
    prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  })
}
