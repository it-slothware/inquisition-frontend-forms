import { type FormFieldValidator } from './validators'

export function isFieldLabel(possibleLabel: any): possibleLabel is string {
  return typeof possibleLabel === 'string'
}

export function isBoolean(possibleBoolean: any): possibleBoolean is boolean {
  return typeof possibleBoolean === 'boolean'
}

export function isValidationFunctionArray(possibleArray: any): possibleArray is FormFieldValidator[] {
  return (
    Array.isArray(possibleArray) && possibleArray.filter((something) => typeof something !== 'function').length === 0
  )
}
