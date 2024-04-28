import { format as prettyFormat } from 'pretty-format'
import { booleanField, isTrue } from '../src'

describe('Boolean field factory', () => {
  // No arguments
  test('Without parameters', () => {
    const field = booleanField()
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(false)
    expect(field.validators.length).toBe(0)
  })

  // Single argument
  test('Label only', () => {
    const field = booleanField('Test label')
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(false)
    expect(field.validators.length).toBe(0)
  })

  test('Default value only', () => {
    const field = booleanField(true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(true)
    expect(field.validators.length).toBe(0)
  })

  test('Validators only', () => {
    const field = booleanField([isTrue])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(false)
    expect(field.validators.length).toBe(1)
  })

  // Two arguments
  test('Label and default value', () => {
    const field = booleanField('Test label', true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(true)
    expect(field.validators.length).toBe(0)
  })

  test('Label and validators', () => {
    const field = booleanField('Test label', [isTrue])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(false)
    expect(field.validators.length).toBe(1)
  })

  test('Default value and nullable', () => {
    const field = booleanField(null, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(0)
  })

  test('Default value, validators', () => {
    const field = booleanField(true, [isTrue])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(true)
    expect(field.validators.length).toBe(1)
  })

  // Three arguments
  test('Label, default value and nullable', () => {
    const field = booleanField('Test label', true, true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(true)
    expect(field.validators.length).toBe(0)
  })

  test('Label, default value, validators', () => {
    const field = booleanField('Test label', true, [isTrue])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(true)
    expect(field.validators.length).toBe(1)
  })

  test('Default value, nullable, validators', () => {
    const field = booleanField(null, true, [isTrue])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
  })

  // Four argument
  test('Label, default value, nullable, validators', () => {
    const field = booleanField('Test label', null, true, [isTrue])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
  })

  test('Default value as callable', () => {
    const field = booleanField(() => true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe(true)
    expect(field.validators.length).toBe(0)
  })

  test('Default value as callable and nullable', () => {
    const field = booleanField(() => null, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(0)
  })
})

describe.each([
  // Data to test | nullable | expected result | expect warning
  [false, false, false, false],
  [true, false, true, false],
  [null, false, false, true],
  [null, true, null, false],
  [[], false, false, true],
  [[1, 2, 3], false, true, true],
  [{}, false, false, true],
  [{ foo: 'bar' }, false, true, true],
  [0, false, false, true],
  [1, false, true, true],
  ['', false, false, true],
  ['Some string', false, true, true],
])('Test .toNative()', (data, nullable, expected, expectWarning) => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test(`.toNative(${prettyFormat(data)})`, () => {
    const field = booleanField(false, nullable)
    expect(field.toNative(data)).toBe(expected)
    expect(console.warn).toHaveBeenCalledTimes(expectWarning ? 1 : 0)
  })
})
