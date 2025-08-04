import type { AINodeDefinition } from "./ai-node-types"

// AI 노드 라이브러리
export const aiNodeLibrary: AINodeDefinition[] = [
  // 텍스트 생성 노드
  {
    id: "text-generation",
    name: "텍스트 생성",
    description: "AI 모델을 사용하여 텍스트를 생성합니다",
    category: "Text Generation",
    icon: "MessageSquare",
    inputs: [
      {
        id: "prompt",
        name: "prompt",
        label: "프롬프트",
        type: "string",
        description: "생성할 텍스트에 대한 프롬프트",
        required: true,
      },
      {
        id: "context",
        name: "context",
        label: "컨텍스트",
        type: "string",
        description: "추가 컨텍스트 정보",
        required: false,
      },
    ],
    outputs: [
      {
        id: "text",
        name: "text",
        label: "생성된 텍스트",
        type: "string",
        description: "AI가 생성한 텍스트",
      },
      {
        id: "metadata",
        name: "metadata",
        label: "메타데이터",
        type: "object",
        description: "생성 메타데이터",
      },
    ],
    parameters: [
      {
        name: "model",
        type: "select",
        label: "모델",
        description: "사용할 AI 모델",
        default: "gemini-1.5-flash",
        options: [
          "gemini-1.5-flash",
          "gemini-1.5-pro",
          "gemini-pro",
          "claude-3-haiku",
          "claude-3-sonnet",
          "claude-3-opus",
          "gpt-4o",
          "gpt-4-turbo",
          "gpt-3.5-turbo",
        ],
        required: true,
      },
      {
        name: "temperature",
        type: "number",
        label: "Temperature",
        description: "생성 다양성 (0.0 ~ 1.0)",
        default: 0.7,
      },
      {
        name: "maxTokens",
        type: "number",
        label: "최대 토큰",
        description: "생성할 최대 토큰 수",
        default: 1024,
      },
      {
        name: "topP",
        type: "number",
        label: "Top P",
        description: "상위 확률 샘플링",
        default: 0.95,
        advanced: true,
      },
      {
        name: "topK",
        type: "number",
        label: "Top K",
        description: "상위 K개 토큰 샘플링",
        default: 40,
        advanced: true,
      },
    ],
    async execute(inputs, parameters) {
      const { prompt, context } = inputs
      const { model, temperature, maxTokens } = parameters

      // 모델 API 엔드포인트 결정
      let apiEndpoint = ""
      let requestBody = {}
      let apiKey = ""

      if (model.startsWith("gemini")) {
        apiKey = parameters.apiKey
        apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        requestBody = {
          contents: [
            {
              parts: [
                {
                  text: context ? `${prompt}\n\nContext: ${context}` : prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: parameters.topP,
            topK: parameters.topK,
          },
        }
      } else if (model.startsWith("claude")) {
        // Claude API 구현 (실제로는 Anthropic API 키와 엔드포인트 필요)
        apiKey = parameters.anthropicApiKey
        apiEndpoint = "https://api.anthropic.com/v1/messages"
        // Claude API 요청 형식
      } else if (model.startsWith("gpt")) {
        // OpenAI API 구현 (실제로는 OpenAI API 키와 엔드포인트 필요)
        apiKey = parameters.openaiApiKey
        apiEndpoint = "https://api.openai.com/v1/chat/completions"
        // OpenAI API 요청 형식
      }

      try {
        // 실제 API 호출 (여기서는 Gemini API만 구현)
        if (model.startsWith("gemini")) {
          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`API 오류: ${errorData.error?.message || "알 수 없는 오류"}`)
          }

          const data = await response.json()

          // 응답에서 텍스트 추출
          let generatedText = ""
          if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            const textParts = data.candidates[0].content.parts
              .filter((part: any) => part.text)
              .map((part: any) => part.text)

            generatedText = textParts.join("\n")
          }

          return {
            text: generatedText,
            metadata: {
              model,
              promptTokens: Math.ceil((prompt?.length || 0) / 4),
              completionTokens: Math.ceil(generatedText.length / 4),
              finishReason: data.candidates?.[0]?.finishReason || "STOP",
            },
          }
        } else {
          // 다른 모델은 시뮬레이션
          return {
            text: `이것은 ${model} 모델의 시뮬레이션된 응답입니다. 실제 API 키가 필요합니다.`,
            metadata: {
              model,
              simulated: true,
            },
          }
        }
      } catch (error: any) {
        console.error("텍스트 생성 오류:", error)
        throw new Error(`텍스트 생성 오류: ${error.message}`)
      }
    },
  },

  // 요약 노드
  {
    id: "text-summarization",
    name: "텍스트 요약",
    description: "긴 텍스트를 AI를 사용하여 요약합니다",
    category: "Summarization",
    icon: "FileText",
    inputs: [
      {
        id: "text",
        name: "text",
        label: "텍스트",
        type: "string",
        description: "요약할 텍스트",
        required: true,
      },
    ],
    outputs: [
      {
        id: "summary",
        name: "summary",
        label: "요약",
        type: "string",
        description: "요약된 텍스트",
      },
    ],
    parameters: [
      {
        name: "model",
        type: "select",
        label: "모델",
        description: "사용할 AI 모델",
        default: "gemini-1.5-flash",
        options: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"],
        required: true,
      },
      {
        name: "maxLength",
        type: "number",
        label: "최대 길이",
        description: "요약의 최대 길이 (단어 수)",
        default: 100,
      },
      {
        name: "format",
        type: "select",
        label: "형식",
        description: "요약 형식",
        default: "paragraph",
        options: ["paragraph", "bullets", "tweetable"],
      },
    ],
    async execute(inputs, parameters) {
      const { text } = inputs
      const { model, maxLength, format } = parameters

      if (!text) {
        throw new Error("요약할 텍스트가 제공되지 않았습니다.")
      }

      let formatPrompt = ""
      switch (format) {
        case "paragraph":
          formatPrompt = "단락 형식으로 요약해주세요."
          break
        case "bullets":
          formatPrompt = "글머리 기호(•)를 사용하여 요약해주세요."
          break
        case "tweetable":
          formatPrompt = "280자 이내의 트윗 형식으로 요약해주세요."
          break
      }

      const prompt = `다음 텍스트를 ${maxLength}단어 이내로 요약해주세요. ${formatPrompt}\n\n${text}`

      try {
        // 텍스트 생성 노드의 execute 함수 재사용
        const textGenNode = aiNodeLibrary.find((node) => node.id === "text-generation")
        if (!textGenNode) {
          throw new Error("텍스트 생성 노드를 찾을 수 없습니다.")
        }

        const result = await textGenNode.execute({ prompt }, { ...parameters, apiKey: parameters.apiKey })

        return {
          summary: result.text,
        }
      } catch (error: any) {
        console.error("텍스트 요약 오류:", error)
        throw new Error(`텍스트 요약 오류: ${error.message}`)
      }
    },
  },

  // 감정 분석 노드
  {
    id: "sentiment-analysis",
    name: "감정 분석",
    description: "텍스트의 감정을 분석합니다",
    category: "Text Analysis",
    icon: "BarChart",
    inputs: [
      {
        id: "text",
        name: "text",
        label: "텍스트",
        type: "string",
        description: "분석할 텍스트",
        required: true,
      },
    ],
    outputs: [
      {
        id: "sentiment",
        name: "sentiment",
        label: "감정",
        type: "object",
        description: "감정 분석 결과",
      },
    ],
    parameters: [
      {
        name: "model",
        type: "select",
        label: "모델",
        description: "사용할 AI 모델",
        default: "gemini-1.5-flash",
        options: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"],
        required: true,
      },
      {
        name: "detailed",
        type: "boolean",
        label: "상세 분석",
        description: "상세한 감정 분석 결과 제공",
        default: false,
      },
    ],
    async execute(inputs, parameters) {
      const { text } = inputs
      const { model, detailed } = parameters

      if (!text) {
        throw new Error("분석할 텍스트가 제공되지 않았습니다.")
      }

      let prompt = ""
      if (detailed) {
        prompt = `다음 텍스트의 감정을 분석해주세요. 긍정(positive), 부정(negative), 중립(neutral) 중 하나로 분류하고, 0부터 1 사이의 신뢰도 점수와 함께 감정의 강도를 제공해주세요. 또한 주요 감정 키워드를 추출해주세요. JSON 형식으로 응답해주세요: {"sentiment": "positive/negative/neutral", "confidence": 0.95, "intensity": 0.8, "keywords": ["행복", "기쁨"]}\n\n텍스트: ${text}`
      } else {
        prompt = `다음 텍스트의 감정을 분석해주세요. 긍정(positive), 부정(negative), 중립(neutral) 중 하나로만 응답해주세요.\n\n텍스트: ${text}`
      }

      try {
        // 텍스트 생성 노드의 execute 함수 재사용
        const textGenNode = aiNodeLibrary.find((node) => node.id === "text-generation")
        if (!textGenNode) {
          throw new Error("텍스트 생성 노드를 찾을 수 없습니다.")
        }

        const result = await textGenNode.execute({ prompt }, { ...parameters, apiKey: parameters.apiKey })

        if (detailed) {
          try {
            // JSON 응답 파싱 시도
            return {
              sentiment: JSON.parse(result.text),
            }
          } catch (e) {
            // JSON 파싱 실패 시 텍스트 그대로 반환
            return {
              sentiment: {
                raw: result.text,
                error: "JSON 파싱 실패",
              },
            }
          }
        } else {
          // 간단한 감정만 추출
          let sentiment = "neutral"
          const text = result.text.toLowerCase()
          if (text.includes("positive") || text.includes("긍정")) {
            sentiment = "positive"
          } else if (text.includes("negative") || text.includes("부정")) {
            sentiment = "negative"
          }

          return {
            sentiment: {
              label: sentiment,
              raw: result.text,
            },
          }
        }
      } catch (error: any) {
        console.error("감정 분석 오류:", error)
        throw new Error(`감정 분석 오류: ${error.message}`)
      }
    },
  },

  // 코드 생성 노드
  {
    id: "code-generation",
    name: "코드 생성",
    description: "AI를 사용하여 코드를 생성합니다",
    category: "Code Generation",
    icon: "Code",
    inputs: [
      {
        id: "prompt",
        name: "prompt",
        label: "프롬프트",
        type: "string",
        description: "코드 생성을 위한 프롬프트",
        required: true,
      },
    ],
    outputs: [
      {
        id: "code",
        name: "code",
        label: "코드",
        type: "string",
        description: "생성된 코드",
      },
      {
        id: "language",
        name: "language",
        label: "언어",
        type: "string",
        description: "코드 언어",
      },
    ],
    parameters: [
      {
        name: "model",
        type: "select",
        label: "모델",
        description: "사용할 AI 모델",
        default: "gemini-1.5-pro",
        options: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"],
        required: true,
      },
      {
        name: "language",
        type: "select",
        label: "언어",
        description: "코드 언어",
        default: "auto",
        options: ["auto", "javascript", "python", "java", "c++", "go", "rust", "typescript"],
      },
      {
        name: "includeExplanation",
        type: "boolean",
        label: "설명 포함",
        description: "코드에 대한 설명 포함",
        default: true,
      },
    ],
    async execute(inputs, parameters) {
      const { prompt } = inputs
      const { model, language, includeExplanation } = parameters

      if (!prompt) {
        throw new Error("코드 생성을 위한 프롬프트가 제공되지 않았습니다.")
      }

      const langPrompt = language === "auto" ? "" : `${language} 언어로 `
      const explainPrompt = includeExplanation ? "코드에 대한 설명도 함께 제공해주세요." : "코드만 제공해주세요."

      const fullPrompt = `다음 요구사항에 맞는 ${langPrompt}코드를 생성해주세요. ${explainPrompt}\n반드시 마크다운 코드 블록(\`\`\` \`\`\`) 안에 코드를 작성해주세요.\n\n요구사항: ${prompt}`

      try {
        // 텍스트 생성 노드의 execute 함수 재사용
        const textGenNode = aiNodeLibrary.find((node) => node.id === "text-generation")
        if (!textGenNode) {
          throw new Error("텍스트 생성 노드를 찾을 수 없습니다.")
        }

        const result = await textGenNode.execute({ prompt: fullPrompt }, { ...parameters, apiKey: parameters.apiKey })

        // 코드 블록 추출 시도
        let code = result.text
        let detectedLanguage = language === "auto" ? "unknown" : language

        // 마크다운 코드 블록 패턴 (\`\`\`language code \`\`\`)
        const codeBlockRegex = /```([a-zA-Z0-9+#]+)?\s*([\s\S]*?)```/g
        const match = codeBlockRegex.exec(result.text)

        if (match) {
          detectedLanguage = match[1] || detectedLanguage
          code = match[2].trim()
        } else {
          // 코드 블록을 찾지 못한 경우 전체 텍스트를 코드로 처리
          code = result.text.trim()
          console.log("코드 블록을 찾지 못했습니다. 전체 텍스트를 코드로 처리합니다.")
        }

        // 코드가 비어있는지 확인
        if (!code) {
          code = "// 생성된 코드가 없습니다."
          console.error("생성된 코드가 비어 있습니다.")
        }

        return {
          code,
          language: detectedLanguage,
        }
      } catch (error: any) {
        console.error("코드 생성 오류:", error)
        throw new Error(`코드 생성 오류: ${error.message}`)
      }
    },
  },

  // 번역 노드
  {
    id: "translation",
    name: "번역",
    description: "텍스트를 다른 언어로 번역합니다",
    category: "Translation",
    icon: "Globe",
    inputs: [
      {
        id: "text",
        name: "text",
        label: "텍스트",
        type: "string",
        description: "번역할 텍스트",
        required: true,
      },
    ],
    outputs: [
      {
        id: "translatedText",
        name: "translatedText",
        label: "번역된 텍스트",
        type: "string",
        description: "번역된 텍스트",
      },
    ],
    parameters: [
      {
        name: "model",
        type: "select",
        label: "모델",
        description: "사용할 AI 모델",
        default: "gemini-1.5-flash",
        options: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"],
        required: true,
      },
      {
        name: "sourceLanguage",
        type: "select",
        label: "원본 언어",
        description: "번역할 텍스트의 언어",
        default: "auto",
        options: ["auto", "ko", "en", "ja", "zh", "es", "fr", "de", "ru", "pt", "it"],
      },
      {
        name: "targetLanguage",
        type: "select",
        label: "대상 언어",
        description: "번역할 대상 언어",
        default: "en",
        options: ["ko", "en", "ja", "zh", "es", "fr", "de", "ru", "pt", "it"],
        required: true,
      },
      {
        name: "preserveFormatting",
        type: "boolean",
        label: "형식 유지",
        description: "원본 텍스트의 형식 유지",
        default: true,
      },
    ],
    async execute(inputs, parameters) {
      const { text } = inputs
      const { model, sourceLanguage, targetLanguage, preserveFormatting } = parameters

      if (!text) {
        throw new Error("번역할 텍스트가 제공되지 않았습니다.")
      }

      // 언어 코드를 언어 이름으로 변환
      const languageNames: Record<string, string> = {
        auto: "자동 감지",
        ko: "한국어",
        en: "영어",
        ja: "일본어",
        zh: "중국어",
        es: "스페인어",
        fr: "프랑스어",
        de: "독일어",
        ru: "러시아어",
        pt: "포르투갈어",
        it: "이탈리아어",
      }

      const sourceLang = languageNames[sourceLanguage] || sourceLanguage
      const targetLang = languageNames[targetLanguage] || targetLanguage

      const formatPrompt = preserveFormatting ? "원본 텍스트의 형식(줄바꿈, 단락 등)을 유지해주세요." : ""

      const prompt =
        sourceLanguage === "auto"
          ? `다음 텍스트를 ${targetLang}로 번역해주세요. ${formatPrompt}\n\n${text}`
          : `다음 ${sourceLang} 텍스트를 ${targetLang}로 번역해주세요. ${formatPrompt}\n\n${text}`

      try {
        // 텍스트 생성 노드의 execute 함수 재사용
        const textGenNode = aiNodeLibrary.find((node) => node.id === "text-generation")
        if (!textGenNode) {
          throw new Error("텍스트 생성 노드를 찾을 수 없습니다.")
        }

        const result = await textGenNode.execute({ prompt }, { ...parameters, apiKey: parameters.apiKey })

        return {
          translatedText: result.text,
        }
      } catch (error: any) {
        console.error("번역 오류:", error)
        throw new Error(`번역 오류: ${error.message}`)
      }
    },
  },

  // 이미지 분석 노드
  {
    id: "image-analysis",
    name: "이미지 분석",
    description: "이미지를 분석하고 설명합니다",
    category: "Vision",
    icon: "Image",
    inputs: [
      {
        id: "imageUrl",
        name: "imageUrl",
        label: "이미지 URL",
        type: "string",
        description: "분석할 이미지의 URL",
        required: true,
      },
      {
        id: "prompt",
        name: "prompt",
        label: "프롬프트",
        type: "string",
        description: "이미지 분석을 위한 프롬프트",
        required: false,
      },
    ],
    outputs: [
      {
        id: "description",
        name: "description",
        label: "설명",
        type: "string",
        description: "이미지 설명",
      },
      {
        id: "tags",
        name: "tags",
        label: "태그",
        type: "array",
        description: "이미지 태그",
      },
    ],
    parameters: [
      {
        name: "model",
        type: "select",
        label: "모델",
        description: "사용할 AI 모델",
        default: "gemini-1.5-pro-vision",
        options: ["gemini-1.5-pro-vision", "gemini-pro-vision"],
        required: true,
      },
      {
        name: "analysisType",
        type: "select",
        label: "분석 유형",
        description: "이미지 분석 유형",
        default: "general",
        options: ["general", "detailed", "objects", "text", "faces", "colors"],
      },
    ],
    async execute(inputs, parameters) {
      const { imageUrl, prompt } = inputs
      const { model, analysisType } = parameters

      if (!imageUrl) {
        throw new Error("분석할 이미지 URL이 제공되지 않았습니다.")
      }

      // 이 부분은 실제 구현에서는 Gemini Pro Vision API를 호출해야 합니다.
      // 여기서는 시뮬레이션된 응답을 반환합니다.

      let analysisPrompt = ""
      switch (analysisType) {
        case "general":
          analysisPrompt = "이 이미지를 간략하게 설명해주세요."
          break
        case "detailed":
          analysisPrompt = "이 이미지를 자세히 설명해주세요. 주요 객체, 색상, 활동, 배경 등을 포함해주세요."
          break
        case "objects":
          analysisPrompt = "이 이미지에서 발견된 모든 객체를 나열해주세요."
          break
        case "text":
          analysisPrompt = "이 이미지에 있는 모든 텍스트를 추출해주세요."
          break
        case "faces":
          analysisPrompt = "이 이미지에 있는 사람들의 표정과 감정을 설명해주세요."
          break
        case "colors":
          analysisPrompt = "이 이미지의 주요 색상을 분석해주세요."
          break
      }

      const userPrompt = prompt || analysisPrompt

      // 시뮬레이션된 응답
      const simulatedDescription = `이것은 ${model} 모델의 시뮬레이션된 이미지 분석 응답입니다. 실제 API 호출이 필요합니다. 분석 유형: ${analysisType}, 이미지 URL: ${imageUrl}, 프롬프트: ${userPrompt}`

      const simulatedTags = ["시뮬레이션", "이미지", "분석", analysisType]

      return {
        description: simulatedDescription,
        tags: simulatedTags,
      }
    },
  },
]

// AI 노드 조회 함수
export function getAINodeDefinition(nodeId: string): AINodeDefinition | undefined {
  return aiNodeLibrary.find((node) => node.id === nodeId)
}

// 카테고리별 AI 노드 조회 함수
export function getAINodesByCategory(category: string): AINodeDefinition[] {
  return aiNodeLibrary.filter((node) => node.category === category)
}

// 검색 함수
export function searchAINodes(query: string): AINodeDefinition[] {
  const lowerQuery = query.toLowerCase()
  return aiNodeLibrary.filter(
    (node) =>
      node.name.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery) ||
      node.id.toLowerCase().includes(lowerQuery),
  )
}
