export type APIUrl = string | ((params?: any[]) => string)
export type CallbackFunction = (success: boolean) => void

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export interface APIResponseNotifications {
  success: string
  failure: string
}
