import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"

import type {
  CollegeWordCloud,
  StateWordCloud,
  StateEmotions,
  Sentiment,
} from "./models"

export type TDataGetStateWordCloud = {
  keyword: string
  state: string
  year: number
}
export type TDataGetCollegeWordCloud = {
  collegeName: string
  keyword: string
  year: number
}

export class KeywordsService {
  /**
   * Get State Word Cloud
   * @returns StateWordCloud Successful Response
   * @throws ApiError
   */
  public static getStateWordCloud(
    data: TDataGetStateWordCloud,
  ): CancelablePromise<StateWordCloud> {
    const { keyword, state, year } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/keywords/state",
      query: {
        state,
        keyword,
        year,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Get College Word Cloud
   * @returns CollegeWordCloud Successful Response
   * @throws ApiError
   */
  public static getCollegeWordCloud(
    data: TDataGetCollegeWordCloud,
  ): CancelablePromise<CollegeWordCloud> {
    const { collegeName, keyword, year } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/keywords/college",
      query: {
        college_name: collegeName,
        keyword,
        year,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataGetStateEmotions = {
  keyword: string
  state: string
  year: number
}
export type TDataGetCollegeWordCloud = {
  collegeName: string
  keyword: string
  year: number
}

export class EmotionsService {
  /**
   * Get State Emotions
   * @returns StateEmotions Successful Response
   * @throws ApiError
   */
  public static getStateEmotions(
    data: TDataGetStateEmotions,
  ): CancelablePromise<StateEmotions> {
    const { keyword, state, year } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/emotions/state",
      query: {
        state,
        keyword,
        year,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Get College Word Cloud
   * @returns CollegeWordCloud Successful Response
   * @throws ApiError
   */
  public static getCollegeWordCloud(
    data: TDataGetCollegeWordCloud,
  ): CancelablePromise<CollegeWordCloud> {
    const { collegeName, keyword, year } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/emotions/college",
      query: {
        college_name: collegeName,
        keyword,
        year,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataGetSentiments = {
  keyword: string
  year: number
}

export class SentimentsService {
  /**
   * Get Sentiments
   * @returns Sentiment Successful Response
   * @throws ApiError
   */
  public static getSentiments(
    data: TDataGetSentiments,
  ): CancelablePromise<Record<string, Sentiment>> {
    const { keyword, year } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sentiments/",
      query: {
        keyword,
        year,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
