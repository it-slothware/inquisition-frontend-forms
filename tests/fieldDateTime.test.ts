import { format as prettyFormat } from 'pretty-format'
import { dateTimeField, laterThan } from '../src'

describe('DateTime field factory', () => {
  // No arguments
  test('Without parameters', () => {
    const field = dateTimeField()
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(0)
  })

  // Single argument
  test('Label value only', () => {
    const field = dateTimeField('Test label')
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(0)
  })

  test('Default value only', () => {
    const field = dateTimeField(new Date())
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(0)
  })

  test('Nullable only', () => {
    const field = dateTimeField(true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(0)
  })

  test('Validators only', () => {
    const field = dateTimeField([laterThan(new Date())])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(1)
  })

  // Two arguments
  test('Label and default value', () => {
    const field = dateTimeField('Test label', new Date())
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(0)
  })

  test('Label and nullable', () => {
    const field = dateTimeField('Test label', true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(0)
  })

  test('Label and validators', () => {
    const field = dateTimeField('Test label', [laterThan(new Date())])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(1)
  })

  test('Default value and nullable', () => {
    const field = dateTimeField(null, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(0)
  })

  test('Default value and validators', () => {
    const field = dateTimeField('Test label', [laterThan(new Date())])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(1)
  })

  test('Nullable and validators', () => {
    const field = dateTimeField(true, [laterThan(new Date())])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(1)
  })

  // Three arguments
  test('Label, default value and nullable', () => {
    const field = dateTimeField('Test label', new Date(), true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(0)
  })

  test('Label, default value, validators', () => {
    const field = dateTimeField('Test label', new Date(), [laterThan(new Date())])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(1)
  })

  test('Default value, nullable, validators', () => {
    const field = dateTimeField(null, true, [laterThan(new Date())])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
  })

  // Four argument
  test('Label, default value, nullable, validators', () => {
    const field = dateTimeField('Test label', null, true, [laterThan(new Date())])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
  })

  test('Default value as callable', () => {
    const field = dateTimeField(() => new Date())
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBeInstanceOf(Date)
    expect(field.validators.length).toBe(0)
  })

  test('Default value as callable and nullable', () => {
    const field = dateTimeField(() => null, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(0)
  })
})

describe.each([
  // Data to test | nullable | expected result | expect warning
  [false, false, new Date('2024-07-01 12:34:55'), true],
  [true, false, new Date('2024-07-01 12:34:55'), true],
  [null, false, new Date('2024-07-01 12:34:55'), true],
  [null, true, null, false],
  [[], false, new Date('2024-07-01 12:34:55'), true],
  [[1, 2, 3], false, new Date('2024-07-01 12:34:55'), true],
  [{}, false, new Date('2024-07-01 12:34:55'), true],
  [{ foo: 'bar' }, false, new Date('2024-07-01 12:34:55'), true],
  [0, false, new Date('2024-07-01 12:34:55'), true],
  [1, false, new Date('2024-07-01 12:34:55'), true],
  [12.56, false, new Date('2024-07-01 12:34:55'), true],
  ['5', false, new Date('2024-07-01 12:34:55'), true],
  ['12.56', false, new Date('2024-07-01 12:34:55'), true],
  ['', false, new Date('2024-07-01 12:34:55'), true],
  ['  ', false, new Date('2024-07-01 12:34:55'), true],
  ['Some string', false, new Date('2024-07-01 12:34:55'), true],
  ['2024-07-01T12:34:55+0000', false, new Date('2024-07-01 12:34:55'), false],
  ['2024-07-01T12:34:55Z', false, new Date('2024-07-01 12:34:55'), false],
])('Test .toNative()', (data, nullable, expected, expectWarning) => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation()
    jest.useFakeTimers().setSystemTime(new Date('2024-07-01 12:34:55'))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  test(`.toNative(${prettyFormat(data)})`, () => {
    const field = dateTimeField('', nullable)
    const nativeValue = field.toNative(data)
    if (nativeValue === null) expect(nativeValue).toBe(null)
    else expect(nativeValue).toBeInstanceOf(Date)
    expect(console.warn).toHaveBeenCalledTimes(expectWarning ? 1 : 0)
  })
})
