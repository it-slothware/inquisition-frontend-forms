type FormFieldValidatorResult = string | string[] | null | void
export type FormFieldValidator = (value: any) => FormFieldValidatorResult

export function notNull(value: any): FormFieldValidatorResult {
  if (value === null) return 'Ez az érték nem lehet üres'
}

export function notBlank(value: string): FormFieldValidatorResult {
  if (value === '') return 'Ez a mező nem lehet üres'
}

export function notEmptySelection(value: string | string[] | number | number[] | null): FormFieldValidatorResult {
  const errorMessage = 'Ez a mező nem lehet üres'
  if (Array.isArray(value) && value.length === 0) return errorMessage
  if (value === '' || value === 0 || value === null) return errorMessage
}

export function limitChoices<T = string>(choices: T[] | Record<string, T>) {
  return function limitChoicesValidator(value: T) {
    if (!Array.isArray(choices)) choices = Object.values(choices)
    if (!choices.includes(value)) return `Hibás választás. Lehetőségek: ${choices.join(', ')}`
  }
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

export function greaterOrEqualThan(minValue: number) {
  return function (value: any) {
    if (typeof value === 'number' && !isNaN(value) && value <= minValue) {
      return `Az értéknek nagyobbnak vagy egyenlőnek kell lennie mint ${minValue}`
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

export function lessOrEqualThan(maxValue: number) {
  return function (value: any) {
    if (typeof value === 'number' && !isNaN(value) && value >= maxValue) {
      return `Az értéknek kisebbnek vagy egyenlőnek kell lennie mint ${maxValue}`
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
