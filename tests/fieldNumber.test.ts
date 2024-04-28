import { format as prettyFormat } from 'pretty-format'
import { numberField, greaterThan } from '../src'
import * as trace_events from 'node:trace_events'

describe('Number field factory', () => {
  // No arguments
  test('Without parameters', () => {
    const field = numberField()
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(0)
    expect(field.validators.length).toBe(0)
  })

  // Single argument
  test('Label value only', () => {
    const field = numberField('Test label')
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(0)
    expect(field.validators.length).toBe(0)
  })

  test('Default value only', () => {
    const field = numberField(42)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(42)
    expect(field.validators.length).toBe(0)
  })

  test('Nullable only', () => {
    const field = numberField(true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(0)
    expect(field.validators.length).toBe(0)
  })

  test('Validators only', () => {
    const field = numberField([greaterThan(12)])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(0)
    expect(field.validators.length).toBe(1)
  })

  // Two arguments
  test('Label and default value', () => {
    const field = numberField('Test label', 42)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(42)
    expect(field.validators.length).toBe(0)
  })

  test('Label and nullable', () => {
    const field = numberField('Test label', true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(0)
    expect(field.validators.length).toBe(0)
  })

  test('Label and validators', () => {
    const field = numberField('Test label', [greaterThan(12)])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(0)
    expect(field.validators.length).toBe(1)
  })

  test('Default value and nullable', () => {
    const field = numberField(null, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(0)
  })

  test('Default value and validators', () => {
    const field = numberField('Test label', [greaterThan(12)])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(0)
    expect(field.validators.length).toBe(1)
  })

  test('Nullable and validators', () => {
    const field = numberField(true, [greaterThan(12)])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(0)
    expect(field.validators.length).toBe(1)
  })

  // Three arguments
  test('Label, default value and nullable', () => {
    const field = numberField('Test label', 42, true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(42)
    expect(field.validators.length).toBe(0)
  })

  test('Label, default value, validators', () => {
    const field = numberField('Test label', 42, [greaterThan(12)])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(42)
    expect(field.validators.length).toBe(1)
  })

  test('Default value, nullable, validators', () => {
    const field = numberField(null, true, [greaterThan(12)])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
  })

  // Four argument
  test('Label, default value, nullable, validators', () => {
    const field = numberField('Test label', null, true, [greaterThan(12)])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
  })

  test('Default value as callable', () => {
    const field = numberField(() => 42)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(42)
    expect(field.validators.length).toBe(0)
  })

  test('Default value as callable and nullable', () => {
    const field = numberField(() => null, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(0)
  })
})

describe.each([
  // Data to test | nullable | expected result | expect warning
  [false, false, 0, true],
  [true, false, 0, true],
  [null, false, 0, true],
  [null, true, null, false],
  [[], false, 0, true],
  [[1, 2, 3], false, 0, true],
  [{}, false, 0, true],
  [{ foo: 'bar' }, false, 0, true],
  [0, false, 0, false],
  [1, false, 1, false],
  [12.56, false, 12.56, false],
  ['5', false, 5, false],
  ['12.56', false, 12.56, false],
  ['-23', false, -23, false],
  ['  44  ', false, 44, false],
  ['  -88  ', false, -88, false],
  ['1 000', false, 1000, false],
  ['-9 999 999', false, -9999999, false],
  ['', false, 0, true],
  ['  ', false, 0, true],
  ['Some string', false, 0, true],
])('Test .toNative()', (data, nullable, expected, expectWarning) => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test(`.toNative(${prettyFormat(data)})`, () => {
    const field = numberField('', nullable)
    expect(field.toNative(data)).toBe(expected)
    expect(console.warn).toHaveBeenCalledTimes(expectWarning ? 1 : 0)
  })
})
