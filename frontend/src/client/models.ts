export type CollegeWordCloud = {
  college_name: string
}

export type HTTPValidationError = {
  detail?: Array<ValidationError>
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
