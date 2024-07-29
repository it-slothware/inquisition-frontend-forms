import { charField, notBlank, numberField, readOnlyEndpointFormDefinition } from '../../src'
import { ReadOnlyEndpointForm } from '../../src/apiInterfaces/readOnlyEndpoint'

const testFormDefinition = readOnlyEndpointFormDefinition('/test/', {
  id: numberField(42),
  name: charField('foo', [notBlank]),
})

describe('Read only endpoint form definition test', () => {
  test('Test URL', () => {
    const url = testFormDefinition.url
    expect(url).toBe('/test/')
  })

  test('Test new', () => {
    const form = testFormDefinition.new()
    expect(form).toBeInstanceOf(ReadOnlyEndpointForm)
  })
})

describe('Read only endpoint form', () => {
  test('Default data', () => {
    const form = testFormDefinition.new()
    expect(form.data.value).toStrictEqual({
      id: 42,
      name: 'foo',
    })
  })

  test('No errors', () => {
    const form = testFormDefinition.new()
    expect(form.errors.value).toStrictEqual({
      id: [],
      name: [],
      non_field_errors: [],
    })
  })

  test('Form errors', () => {
    const form = testFormDefinition.new()
    form.data.value.name = ''
    form.validate()
    expect(form.errors.value).toStrictEqual({
      id: [],
      name: ['Ez a mező nem lehet üres'],
      non_field_errors: [],
    })
  })
})
