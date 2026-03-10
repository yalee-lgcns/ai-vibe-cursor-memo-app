import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

interface SummarizeResponse {
  summary: string
  relatedUrls: { title: string; url: string }[]
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' },
      { status: 500 },
    )
  }

  try {
    const { title, content } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '메모 내용이 필요합니다.' },
        { status: 400 },
      )
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `다음 메모를 분석하여 요약과 관련 참고 사이트를 제공해주세요.\n\n제목: ${title}\n\n내용:\n${content}`,
      config: {
        systemInstruction:
          '당신은 메모 요약 및 리서치 전문가입니다. 다음 두 가지를 JSON으로 반환하세요:\n1. "summary": 핵심 내용을 3~5줄 이내로 간결하게 한국어 요약 (마크다운 형식)\n2. "relatedUrls": 메모 주제와 관련된 실제 참고 사이트 3개 (각각 title과 url 포함). 실제로 존재하는 유명한 사이트만 추천하세요 (공식 문서, 위키피디아, 블로그 등).',
        temperature: 0.3,
        maxOutputTokens: 800,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object' as const,
          properties: {
            summary: { type: 'string' as const },
            relatedUrls: {
              type: 'array' as const,
              items: {
                type: 'object' as const,
                properties: {
                  title: { type: 'string' as const },
                  url: { type: 'string' as const },
                },
                required: ['title', 'url'],
              },
            },
          },
          required: ['summary', 'relatedUrls'],
        },
      },
    })

    const text = response.text

    if (!text) {
      return NextResponse.json(
        { error: '요약 생성에 실패했습니다.' },
        { status: 500 },
      )
    }

    const parsed: SummarizeResponse = JSON.parse(text)

    return NextResponse.json({
      summary: parsed.summary,
      relatedUrls: parsed.relatedUrls.slice(0, 3),
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
