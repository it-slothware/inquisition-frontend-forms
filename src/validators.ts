type FormFieldValidatorResult = string | string[] | null | undefined
export type FormFieldValidator = (value: any) => FormFieldValidatorResult

export function notNull(value: any): FormFieldValidatorResult {
  if (value === null) return 'Ez az érték nem lehet null'
}

export function notBlank(value: string): FormFieldValidatorResult {
  if (value === '') return 'Ez a mező nem lehet üres'
}

const emailRegex =
  /^[a-zA-Z0-9]+([_\-.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9])*(\.[a-zA-Z0-9]+(-[a-zA-Z0-9])*)*\.[a-zA-Z]{2,}$/

export function isEmail(value: string): FormFieldValidatorResult {
  if (value === null || value === '') return null
  if (value.match(emailRegex)) return null
  return 'Hibás email cím'
}

export function notEmpty(value: any[]): FormFieldValidatorResult {
  if (value === null) return null
  return value.length === 0 ? 'Nem lehet üres lista' : null
}

export function isTrue(value: any): FormFieldValidatorResult {
  if (!value) return 'Az érték nem igaz'
}

export function isFalse(value: any): FormFieldValidatorResult {
  if (!!value) return 'Az érték nem hamis'
}

export function greaterThan(minValue: number) {
  return function (value: any) {
    if (typeof value === 'number' && !isNaN(value) && value <= minValue) {
      return `Az értéknek nagyobbnak kell lennie mint ${minValue}`
    }
  }
}

export function lessThan(maxValue: number) {
  return function (value: any) {
    if (typeof value === 'number' && !isNaN(value) && value >= maxValue) {
      return `Az értéknek kisebbnek kell lennie mint ${maxValue}`
    }
  }
}

export function laterThan(earlierDate: Date) {
  return function (value: any) {
    if (value instanceof Date && value.getTime() <= earlierDate.getTime()) {
      return `A dátumnak későbbinek kell lennie mint ${earlierDate.toISOString()}`
    }
  }
}

export function soonerThan(laterDate: Date) {
  return function (value: any) {
    if (value instanceof Date && value.getTime() >= laterDate.getTime()) {
      return `A dátumnak korábbinak kell lennie mint ${laterDate.toISOString()}`
    }
  }
}
