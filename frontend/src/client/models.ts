export type CollegeWordCloud = {
  state: string
  words: Record<string, unknown>
  keyword: string
  college_name: string
}

export type HTTPValidationError = {
  detail?: Array<ValidationError>
}

export type Sentiment = {
  negative: number
  positive: number
  neutral: number
}

export type StateEmotions = {
  state: string
  keyword: string
  predicted_emotions: Array<string>
  emotion_counts: Record<string, unknown>
}

export type StateWordCloud = {
  state: string
  words: Record<string, unknown>
  keyword: string
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}
