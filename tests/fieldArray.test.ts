import { format as prettyFormat } from 'pretty-format'
import { arrayField, numberField, notEmpty, fieldSet } from '../src'

describe('Array field factory', () => {
  // Single argument
  test('Base field only', () => {
    const field = arrayField(numberField())
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([])
    expect(field.validators.length).toBe(0)
  })

  // Two arguments
  test('Base field, default value', () => {
    const field = arrayField(numberField(), () => [6])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([6])
    expect(field.validators.length).toBe(0)
  })

  test('Base field, initial length', () => {
    const field = arrayField(numberField(), 3)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([0, 0, 0])
    expect(field.validators.length).toBe(0)
  })

  test('Base field, nullable', () => {
    const field = arrayField(numberField(), true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([])
    expect(field.validators.length).toBe(0)
  })

  test('Base field, validators', () => {
    const field = arrayField(numberField(), [notEmpty])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([])
    expect(field.validators.length).toBe(1)
  })

  test('Label, base field', () => {
    const field = arrayField('Test label', numberField())
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([])
    expect(field.validators.length).toBe(0)
  })

  // Three arguments
  test('Base field, default value, nullable', () => {
    const field = arrayField(numberField(), () => [6], true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([6])
    expect(field.validators.length).toBe(0)
  })

  test('Base field, default value, validators', () => {
    const field = arrayField(numberField(), () => [6], [notEmpty])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([6])
    expect(field.validators.length).toBe(1)
  })

  test('Base field, initial length, nullable', () => {
    const field = arrayField(numberField(), 3, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([0, 0, 0])
    expect(field.validators.length).toBe(0)
  })

  test('Base field, initial length, validators', () => {
    const field = arrayField(numberField(), 3, [notEmpty])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([0, 0, 0])
    expect(field.validators.length).toBe(1)
  })

  test('Base field, nullable, validators', () => {
    const field = arrayField(numberField(), true, [notEmpty])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([])
    expect(field.validators.length).toBe(1)
  })

  test('Label, base field, default value', () => {
    const field = arrayField('Test label', numberField(), () => [42])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([42])
    expect(field.validators.length).toBe(0)
  })

  test('Label, base field, initial length', () => {
    const field = arrayField('Test label', numberField(), 2)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([0, 0])
    expect(field.validators.length).toBe(0)
  })

  test('Label, base field, nullable', () => {
    const field = arrayField('Test label', numberField(), true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([])
    expect(field.validators.length).toBe(0)
  })

  test('Label, base field, validators', () => {
    const field = arrayField('Test label', numberField(), [notEmpty])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([])
    expect(field.validators.length).toBe(1)
  })

  // Four argument
  test('Base field, default value, nullable, validators', () => {
    const field = arrayField(numberField(), () => [6], true, [notEmpty])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([6])
    expect(field.validators.length).toBe(1)
  })

  test('Base field, initial length, nullable, validators', () => {
    const field = arrayField(numberField(), 1, true, [notEmpty])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([0])
    expect(field.validators.length).toBe(1)
  })

  test('Label, base field, default value, nullable', () => {
    const field = arrayField('Test label', numberField(), () => [6], true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([6])
    expect(field.validators.length).toBe(0)
  })

  test('Label, base field, default value, validators', () => {
    const field = arrayField('Test label', numberField(), () => [6], [notEmpty])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([6])
    expect(field.validators.length).toBe(1)
  })

  test('Label, base field, initial length, nullable', () => {
    const field = arrayField('Test label', numberField(), 3, true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([0, 0, 0])
    expect(field.validators.length).toBe(0)
  })

  test('Label, base field, initial length, validators', () => {
    const field = arrayField('Test label', numberField(), 3, [notEmpty])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([0, 0, 0])
    expect(field.validators.length).toBe(1)
  })

  test('Label, base field, nullable, validators', () => {
    const field = arrayField('Test label', numberField(), true, [notEmpty])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([])
    expect(field.validators.length).toBe(1)
  })

  // Five arguments
  test('Label, base field, default value, nullable, validators', () => {
    const field = arrayField('Test label', numberField(), () => [12, 42], true, [notEmpty])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([12, 42])
    expect(field.validators.length).toBe(1)
  })

  test('Label, base field, initial length, nullable, validators', () => {
    const field = arrayField('Test label', numberField(), 4, true, [notEmpty])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([0, 0, 0, 0])
    expect(field.validators.length).toBe(1)
  })
})

describe('Default value', () => {
  test('Test default value immutability', () => {
    const field = arrayField(numberField(), () => [1, 2])
    const defaultValue = field.getDefault()
    expect(defaultValue).toStrictEqual([1, 2])
    expect(defaultValue).toStrictEqual(field.getDefault())

    defaultValue.splice(0, 2, 42)

    expect(defaultValue).toStrictEqual([42])
    expect(defaultValue).not.toStrictEqual(field.getDefault())
    expect(field.getDefault()).toStrictEqual([1, 2])
  })
})

describe('Base field types', () => {
  test('Test base fieldset', () => {
    const field = arrayField({ id: numberField(42) }, 1)
    expect(field.getDefault()).toStrictEqual([{ id: 42 }])
  })
  test('Test base fieldset whith nullable field', () => {
    const field = arrayField({ id: numberField(null, true) }, 1)
    expect(field.getDefault()).toStrictEqual([{ id: null }])
  })
  test('Test base nullable fieldset', () => {
    const field = arrayField(fieldSet({ id: numberField(null, true) }, null, true), 1)
    expect(field.getDefault()).toStrictEqual([null])
  })
  test('Test base field', () => {
    const field = arrayField(numberField(42), 1)
    expect(field.getDefault()).toStrictEqual([42])
  })
  test('Test base nullable field', () => {
    const field = arrayField(numberField(null, true), 1)
    expect(field.getDefault()).toStrictEqual([null])
  })
})

describe('Test default values', () => {
  test('Default value as callable', () => {
    const field = arrayField(numberField(), () => [42])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual([42])
    expect(field.validators.length).toBe(0)
  })

  test('Default value as callable and field nullable', () => {
    const field = arrayField(numberField(true), () => [null], true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual([null])
    expect(field.validators.length).toBe(0)
  })

  test('Default value as callable and nullable', () => {
    const field = arrayField(numberField(), () => null, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual(null)
    expect(field.validators.length).toBe(0)
  })
})

describe.each([
  // Data to test | nullable | expected result | expect warning
  [false, false, [], true],
  [true, false, [], true],
  [null, false, [], true],
  [null, true, null, false],
  [[], false, [], false],
  [[1, 2, 3], false, [1, 2, 3], false],
  [{}, false, [], true],
  [{ foo: 'bar' }, false, [], true],
  [0, false, [], true],
  [1, false, [], true],
  [12.56, false, [], true],
  ['5', false, [], true],
])('Test .toNative()', (data, nullable, expected, expectWarning) => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test(`.toNative(${prettyFormat(data)})`, () => {
    const field = arrayField(numberField(), nullable)
    expect(field.toNative(data)).toStrictEqual(expected)
    expect(console.warn).toHaveBeenCalledTimes(expectWarning ? 1 : 0)
  })
})
