import { format as prettyFormat } from 'pretty-format'
import { fieldSet, charField, numberField } from '../../src'

function idIsSetValidator(value: any): string | void {
  if (!value.id) return 'Invalid ID value'
}

describe('Char field factory', () => {
  // Single argument
  test('Raw fieldset only', () => {
    const field = fieldSet({
      id: numberField(),
      name: charField(),
    })
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual({ id: 0, name: '' })
    expect(field.validators.length).toBe(0)
  })

  // Two arguments
  test('Raw fieldset and default value', () => {
    const field = fieldSet(
      {
        id: numberField(),
        name: charField(),
      },
      () => {
        return {
          id: 42,
          name: 'Foo Bar',
        }
      },
    )
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual({ id: 42, name: 'Foo Bar' })
    expect(field.validators.length).toBe(0)
  })

  test('Raw fieldset and nullable', () => {
    const field = fieldSet(
      {
        id: numberField(),
        name: charField(),
      },
      true,
    )
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual({ id: 0, name: '' })
    expect(field.validators.length).toBe(0)
  })

  test('Raw fieldset and validators', () => {
    const field = fieldSet(
      {
        id: numberField(),
        name: charField(),
      },
      [idIsSetValidator],
    )
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual({ id: 0, name: '' })
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(idIsSetValidator)
  })

  test('Label and raw fieldset', () => {
    const field = fieldSet('Test label', {
      id: numberField(),
      name: charField(),
    })
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual({ id: 0, name: '' })
    expect(field.validators.length).toBe(0)
  })

  // Three arguments
  test('Raw fieldset, default value and nullable', () => {
    const field = fieldSet(
      {
        id: numberField(),
        name: charField(),
      },
      () => {
        return null
      },
      true,
    )
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual(null)
    expect(field.validators.length).toBe(0)
  })

  test('Raw fieldset, default value and validators', () => {
    const field = fieldSet(
      {
        id: numberField(),
        name: charField(),
      },
      () => {
        return { id: 42, name: 'Foo Bar' }
      },
      [idIsSetValidator],
    )
    expect(field.label).toBe('')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual({ id: 42, name: 'Foo Bar' })
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(idIsSetValidator)
  })

  test('Label, raw fieldset and default value', () => {
    const field = fieldSet(
      'Test label',
      {
        id: numberField(),
        name: charField(),
      },
      () => {
        return {
          id: 42,
          name: 'Foo Bar',
        }
      },
    )
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(false)
    expect(field.getDefault()).toStrictEqual({ id: 42, name: 'Foo Bar' })
    expect(field.validators.length).toBe(0)
  })

  test('Label, raw fieldset and nullable', () => {
    const field = fieldSet(
      'Test label',
      {
        id: numberField(),
        name: charField(),
      },
      true,
    )
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toStrictEqual({ id: 0, name: '' })
    expect(field.validators.length).toBe(0)
  })

  // Four argument
  test('Raw fieldset, default value, nullable and validators', () => {
    const field = fieldSet(
      { id: numberField(), name: charField() },
      () => {
        return null
      },
      true,
      [idIsSetValidator],
    )
    expect(field.label).toBe('')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(idIsSetValidator)
  })

  test('Label, raw fieldset, default value and nullable', () => {
    const field = fieldSet(
      'Test label',
      { id: numberField(), name: charField() },
      () => {
        return null
      },
      true,
    )
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(0)
  })

  test('Label, raw fieldset, default value, nullable and validators', () => {
    const field = fieldSet(
      'Test label',
      { id: numberField(), name: charField() },
      () => {
        return null
      },
      true,
      [idIsSetValidator],
    )
    expect(field.label).toBe('Test label')
    expect(field.nullable).toBe(true)
    expect(field.getDefault()).toBe(null)
    expect(field.validators.length).toBe(1)
    expect(field.validators[0]).toBe(idIsSetValidator)
  })
})

describe('Test default values', () => {
  // test('Default value as callable', () => {
  //   const field = charField(() => 'Some default')
  //   expect(field.label).toBe('')
  //   expect(field.nullable).toBe(false)
  //   expect(field.getDefault()).toBe('Some default')
  //   expect(field.validators.length).toBe(0)
  // })
  //
  // test('Default value as callable and nullable', () => {
  //   const field = charField(() => null, true)
  //   expect(field.label).toBe('')
  //   expect(field.nullable).toBe(true)
  //   expect(field.getDefault()).toBe(null)
  //   expect(field.validators.length).toBe(0)
  // })
})

// describe.each([
//   // Data to test | nullable | expected result | expect warning
//   [false, false, 'false'],
//   [true, false, 'true'],
//   [null, false, 'null'],
//   [null, true, null],
//   [[], false, '[]'],
//   [[1, 2, 3], false, '[1,2,3]'],
//   [{}, false, '[object Object]'],
//   [{ foo: 'bar' }, false, '[object Object]'],
//   [0, false, '0'],
//   [1, false, '1'],
//   ['', false, ''],
//   ['Some string', false, 'Some string'],
// ])('Test .toNative()', (data, nullable, expected) => {
//   test(`.toNative(${prettyFormat(data)})`, () => {
//     const field = charField('', nullable)
//     expect(field.toNative(data)).toBe(expected)
//   })
// })
