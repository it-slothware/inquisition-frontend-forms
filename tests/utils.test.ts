import { isFieldLabel, isBoolean, isValidationFunctionArray, range } from '../src/utils'

test('isFieldLabel', () => {
  expect(isFieldLabel('')).toBe(true)
  expect(isFieldLabel('Some label')).toBe(true)
  expect(isFieldLabel(false)).toBe(false)
  expect(isFieldLabel(12)).toBe(false)
  expect(isFieldLabel(NaN)).toBe(false)
  expect(isFieldLabel(null)).toBe(false)
  expect(isFieldLabel(undefined)).toBe(false)
  expect(isFieldLabel(() => {})).toBe(false)
  expect(isFieldLabel({})).toBe(false)
  expect(isFieldLabel([])).toBe(false)
})

test('isBoolean', () => {
  expect(isBoolean(false)).toBe(true)
  expect(isBoolean(true)).toBe(true)
  expect(isBoolean('')).toBe(false)
  expect(isBoolean(12)).toBe(false)
  expect(isBoolean(NaN)).toBe(false)
  expect(isBoolean(null)).toBe(false)
  expect(isBoolean(undefined)).toBe(false)
  expect(isBoolean(() => {})).toBe(false)
  expect(isBoolean({})).toBe(false)
  expect(isBoolean([])).toBe(false)
})

test('isValidationFunctionArray', () => {
  expect(isValidationFunctionArray([])).toBe(true)
  expect(isValidationFunctionArray([() => {}, () => {}])).toBe(true)
  expect(isValidationFunctionArray(['not a function'])).toBe(false)
  expect(isValidationFunctionArray([() => {}, 'not a function'])).toBe(false)
  expect(isValidationFunctionArray(false)).toBe(false)
  expect(isValidationFunctionArray('')).toBe(false)
  expect(isValidationFunctionArray(12)).toBe(false)
  expect(isValidationFunctionArray(NaN)).toBe(false)
  expect(isValidationFunctionArray(null)).toBe(false)
  expect(isValidationFunctionArray(undefined)).toBe(false)
  expect(isValidationFunctionArray(() => {})).toBe(false)
  expect(isValidationFunctionArray({})).toBe(false)
})

test('range', () => {
  expect(range(3)).toStrictEqual([0, 1, 2])
  expect(range(2, 5)).toStrictEqual([2, 3, 4])
  expect(range(5, 3)).toStrictEqual([])
})
