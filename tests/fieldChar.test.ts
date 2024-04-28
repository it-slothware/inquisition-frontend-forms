import { format as prettyFormat } from 'pretty-format'
import { charField, notBlank } from '../src'

describe('Char field factory', () => {
  // No arguments
  test('Without parameters', () => {
    const field = charField()
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe('')
    expect(field.validators.length).toBe(0)
  })

  // Single argument
  test('Default value only', () => {
    const field = charField('Some default')
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe('Some default')
    expect(field.validators.length).toBe(0)
  })

  test('Nullable only', () => {
    const field = charField(true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe('')
    expect(field.validators.length).toBe(0)
  })

  test('Validators only', () => {
    const field = charField([notBlank])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe('')
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(notBlank)
  })

  // Two arguments
  test('Label and default value', () => {
    const field = charField('Test label', 'Some default')
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe('Some default')
    expect(field.validators.length).toBe(0)
  })

  test('Default value and nullable', () => {
    const field = charField(null, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(0)
  })

  test('Default value and validators', () => {
    const field = charField('Some default', [notBlank])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe('Some default')
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(notBlank)
  })

  test('Nullable and validators', () => {
    const field = charField(true, [notBlank])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe('')
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(notBlank)
  })

  // Three arguments
  test('Label, default value and nullable', () => {
    const field = charField('Test label', 'Some default', true)
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe('Some default')
    expect(field.validators.length).toBe(0)
  })

  test('Label, default value, validators', () => {
    const field = charField('Test label', 'Some default', [notBlank])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe('Some default')
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(notBlank)
  })

  test('Default value, nullable, validators', () => {
    const field = charField(null, true, [notBlank])
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(notBlank)
  })

  // Four argument
  test('Label, default value, nullable, validators', () => {
    const field = charField('Test label', null, true, [notBlank])
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(notBlank)
  })

  test('Default value as callable', () => {
    const field = charField(() => 'Some default')
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toBe('Some default')
    expect(field.validators.length).toBe(0)
  })

  test('Default value as callable and nullable', () => {
    const field = charField(() => null, true)
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(0)
  })
})

describe.each([
  // Data to test | nullable | expected result | expect warning
  [false, false, 'false'],
  [true, false, 'true'],
  [null, false, 'null'],
  [null, true, null],
  [[], false, '[]'],
  [[1, 2, 3], false, '[1,2,3]'],
  [{}, false, '[object Object]'],
  [{ foo: 'bar' }, false, '[object Object]'],
  [0, false, '0'],
  [1, false, '1'],
  ['', false, ''],
  ['Some string', false, 'Some string'],
])('Test .toNative()', (data, nullable, expected) => {
  test(`.toNative(${prettyFormat(data)})`, () => {
    const field = charField('', nullable)
    expect(field.toNative(data)).toBe(expected)
  })
})
