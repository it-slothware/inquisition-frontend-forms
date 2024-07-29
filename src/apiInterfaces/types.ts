export type APIUrl = string | ((params?: any) => string)
export type CallbackFunction = (success: boolean) => void
