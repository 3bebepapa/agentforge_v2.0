"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Component, ComponentSpec, ComponentValidationResult } from "../types/component-types"
import { getLLMService } from "../services/llm-service"

// 로컬 스토리지 키
const COMPONENTS_STORAGE_KEY = "agentforge-components"

export function useComponentAutomator(apiKey?: string) {
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // 컴포넌트 로드
  useEffect(() => {
    const storedComponents = localStorage.getItem(COMPONENTS_STORAGE_KEY)
    if (storedComponents) {
      try {
        setComponents(JSON.parse(storedComponents))
      } catch (error) {
        console.error("컴포넌트 로드 오류:", error)
      }
    } else {
      // 초기 샘플 컴포넌트 생성
      const initialComponents: Component[] = [
        {
          id: uuidv4(),
          name: "HTTP 클라이언트",
          type: "integration",
          description: "외부 API와 통신하기 위한 HTTP 클라이언트 컴포넌트",
          features: ["GET 요청", "POST 요청", "헤더 설정", "응답 처리"],
          code: `class HttpClient {
  constructor() {
    this.name = "HTTP 클라이언트";
    this.type = "integration";
    this.baseUrl = "";
    this.headers = {};
  }

  setBaseUrl(url) {
    this.baseUrl = url;
    return this;
  }

  setHeaders(headers) {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  async get(path, params = {}) {
    try {
      const url = new URL(this.baseUrl + path);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP 오류: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("GET 요청 오류:", error);
      throw error;
    }
  }

  async post(path, data) {
    try {
      const url = this.baseUrl + path;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP 오류: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("POST 요청 오류:", error);
      throw error;
    }
  }
}

export default HttpClient;`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          validationResult: {
            isValid: true,
            qualityScore: 0.85,
            errors: [],
            warnings: ["오류 처리를 개선할 수 있습니다."],
          },
        },
        {
          id: uuidv4(),
          name: "데이터 변환기",
          type: "data",
          description: "다양한 데이터 형식 간 변환을 수행하는 컴포넌트",
          features: ["JSON 변환", "CSV 변환", "XML 변환", "사용자 정의 변환"],
          code: `class DataTransformer {
  constructor() {
    this.name = "데이터 변환기";
    this.type = "data";
  }

  jsonToCsv(jsonData, options = {}) {
    try {
      if (!Array.isArray(jsonData)) {
        throw new Error("JSON 데이터는 배열이어야 합니다.");
      }
      
      if (jsonData.length === 0) {
        return "";
      }
      
      const delimiter = options.delimiter || ",";
      const header = options.header !== false;
      
      // 헤더 추출
      const headers = Object.keys(jsonData[0]);
      
      // CSV 행 생성
      const rows = jsonData.map(item => {
        return headers.map(fieldName => {
          let field = item[fieldName];
          
          // 문자열이 아닌 경우 변환
          if (typeof field !== 'string') {
            field = JSON.stringify(field);
          }
          
          // 쉼표, 따옴표 등이 포함된 경우 처리
          if (field.includes(delimiter) || field.includes('"') || field.includes('\\n')) {
            field = \`"\${field.replace(/"/g, '""')}"\`;
          }
          
          return field;
        }).join(delimiter);
      });
      
      // 헤더 추가
      if (header) {
        rows.unshift(headers.join(delimiter));
      }
      
      return rows.join('\\n');
    } catch (error) {
      console.error("JSON에서 CSV로 변환 오류:", error);
      throw error;
    }
  }

  csvToJson(csvData, options = {}) {
    try {
      const delimiter = options.delimiter || ",";
      const header = options.header !== false;
      
      const rows = csvData.split('\\n');
      
      if (rows.length === 0) {
        return [];
      }
      
      let headers;
      let startIndex;
      
      if (header) {
        headers = this.parseCSVRow(rows[0], delimiter);
        startIndex = 1;
      } else {
        headers = Array.from({ length: this.parseCSVRow(rows[0], delimiter).length }, (_, i) => \`field\${i}\`);
        startIndex = 0;
      }
      
      return rows.slice(startIndex).filter(row => row.trim()).map(row => {
        const values = this.parseCSVRow(row, delimiter);
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || "";
          return obj;
        }, {});
      });
    } catch (error) {
      console.error("CSV에서 JSON으로 변환 오류:", error);
      throw error;
    }
  }
  
  parseCSVRow(row, delimiter) {
    const result = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }
}

export default DataTransformer;`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          validationResult: {
            isValid: true,
            qualityScore: 0.92,
            errors: [],
            warnings: [],
          },
        },
      ]

      setComponents(initialComponents)
      localStorage.setItem(COMPONENTS_STORAGE_KEY, JSON.stringify(initialComponents))
    }
  }, [])

  // 컴포넌트 저장
  const saveComponents = (updatedComponents: Component[]) => {
    setComponents(updatedComponents)
    localStorage.setItem(COMPONENTS_STORAGE_KEY, JSON.stringify(updatedComponents))
  }

  // 컴포넌트 선택
  const selectComponent = (componentId: string) => {
    setSelectedComponentId(componentId)
  }

  // 컴포넌트 생성
  const generateComponent = async (componentSpec: ComponentSpec) => {
    if (!apiKey) return

    setIsGenerating(true)

    try {
      let code = componentSpec.code

      // 코드가 없는 경우 LLM으로 생성
      if (!code) {
        const llmService = getLLMService(apiKey)
        const prompt = `
다음 명세에 맞는 JavaScript 컴포넌트 클래스를 생성해주세요:

이름: ${componentSpec.name}
유형: ${componentSpec.type}
설명: ${componentSpec.description}
기능:
${componentSpec.features.map((f) => `- ${f}`).join("\n")}

다음 형식으로 코드를 생성해주세요:
1. 클래스 이름은 공백 없이 생성해주세요
2. 주석으로 이름, 설명, 기능을 포함해주세요
3. 생성자에서 필요한 속성을 초기화해주세요
4. 기능에 맞는 메서드를 구현해주세요
5. export default로 클래스를 내보내주세요

코드만 반환해주세요. 설명이나 다른 텍스트는 포함하지 마세요.
`

        code = await llmService.generateText(prompt)
      }

      // 코드 유효성 검사
      const validationResult = validateComponentCode(code)

      // 새 컴포넌트 생성
      const newComponent: Component = {
        id: uuidv4(),
        name: componentSpec.name,
        type: componentSpec.type,
        description: componentSpec.description,
        features: componentSpec.features,
        code,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validationResult,
      }

      // 컴포넌트 추가 및 저장
      const updatedComponents = [...components, newComponent]
      saveComponents(updatedComponents)

      // 새 컴포넌트 선택
      setSelectedComponentId(newComponent.id)

      return newComponent
    } catch (error) {
      console.error("컴포넌트 생성 오류:", error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  // 컴포넌트 업데이트
  const updateComponent = (componentId: string, updates: Partial<ComponentSpec>) => {
    const componentIndex = components.findIndex((c) => c.id === componentId)

    if (componentIndex === -1) return

    const updatedComponent = {
      ...components[componentIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // 코드가 변경된 경우 유효성 검사 다시 수행
    if (updates.code) {
      updatedComponent.validationResult = validateComponentCode(updates.code)
    }

    const updatedComponents = [...components]
    updatedComponents[componentIndex] = updatedComponent

    saveComponents(updatedComponents)
  }

  // 컴포넌트 삭제
  const deleteComponent = (componentId: string) => {
    const updatedComponents = components.filter((c) => c.id !== componentId)

    saveComponents(updatedComponents)

    // 선택된 컴포넌트가 삭제된 경우 선택 해제
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null)
    }
  }

  // 코드 유효성 검사 (간단한 구현)
  const validateComponentCode = (code: string): ComponentValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // 기본 구문 검사
    try {
      new Function(code)
    } catch (error) {
      errors.push(`구문 오류: ${error.message}`)
    }

    // 클래스 선언 확인
    if (!code.includes("class ")) {
      errors.push("클래스 선언이 없습니다.")
    }

    // export default 확인
    if (!code.includes("export default")) {
      errors.push("export default 문이 없습니다.")
    }

    // 생성자 확인
    if (!code.includes("constructor")) {
      warnings.push("생성자가 없습니다.")
    }

    // 오류 처리 확인
    if (!code.includes("try") || !code.includes("catch")) {
      warnings.push("오류 처리가 부족할 수 있습니다.")
    }

    // 주석 확인
    if (!code.includes("//")) {
      warnings.push("코드에 주석이 없습니다.")
    }

    // 품질 점수 계산 (간단한 구현)
    let qualityScore = 1.0

    // 오류당 0.3 감소
    qualityScore -= errors.length * 0.3

    // 경고당 0.1 감소
    qualityScore -= warnings.length * 0.1

    // 0과 1 사이로 제한
    qualityScore = Math.max(0, Math.min(1, qualityScore))

    return {
      isValid: errors.length === 0,
      qualityScore,
      errors,
      warnings,
    }
  }

  return {
    components,
    selectedComponentId,
    isGenerating,
    generateComponent,
    selectComponent,
    updateComponent,
    deleteComponent,
  }
}
