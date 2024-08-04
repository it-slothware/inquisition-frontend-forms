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

export function range(start: number): number[]
export function range(start: number, end: number): number[]
export function range(startOrEnd: number, end?: number): number[] {
  if (!end) {
    end = startOrEnd
    startOrEnd = 0
  }
  if (startOrEnd > end) return []
  return [...Array(end - startOrEnd).keys()].map((i) => i + startOrEnd)
}

import { ref, version } from 'vue'

export function getRef() {
  return ref
}
export function getVersion(): string {
  return version
}
