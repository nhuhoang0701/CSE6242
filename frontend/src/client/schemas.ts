export const $CollegeWordCloud = {
  properties: {
    college_name: {
      type: "string",
      isRequired: true,
      maxLength: 200,
    },
  },
} as const

export const $HTTPValidationError = {
  properties: {
    detail: {
      type: "array",
      contains: {
        type: "ValidationError",
      },
    },
  },
} as const

export const $StateWordCloud = {
  properties: {
    state: {
      type: "string",
      isRequired: true,
      maxLength: 100,
    },
    words: {
      type: "dictionary",
      contains: {
        properties: {},
      },
      isRequired: true,
    },
    keyword: {
      type: "string",
      isRequired: true,
      maxLength: 100,
    },
  },
} as const

export const $ValidationError = {
  properties: {
    loc: {
      type: "array",
      contains: {
        type: "any-of",
        contains: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      },
      isRequired: true,
    },
    msg: {
      type: "string",
      isRequired: true,
    },
    type: {
      type: "string",
      isRequired: true,
    },
  },
} as const
