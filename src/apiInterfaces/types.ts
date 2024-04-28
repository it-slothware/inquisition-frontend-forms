export type APIUrl = string | ((params?: any) => string)
export type APIUrlParams<T extends APIUrl> = T extends Function
  ? T extends (params: infer R) => string
    ? R
    : never
  : never

export interface ValidatedModelInterface {
  resetValidation(): void
}
