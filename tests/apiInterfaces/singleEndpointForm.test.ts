import axios from 'axios'
import { arrayField, charField, fieldSet, notBlank, numberField, singleEndpointFormDefinition } from '../../src'
import { SingleEndpointForm } from '../../src/apiInterfaces/singleEndpoint'
import { ArrayFieldErrors } from '../../src/fields'
import { FieldNames, FieldNamesFromFieldSetRaw } from '../../src/forms'
import { CreateArrayOfLength } from '../../src/types'

jest.mock('axios')

function testPictureValidator(dataToValidate: any) {
  if (dataToValidate.permissions.length > 0 && dataToValidate.pictures.length === 0) return 'Picture error'
}

const mockedAxios = axios as jest.Mocked<typeof axios>
jest.mock('../../src/configurable', () => {
  const originalModule = jest.requireActual('../../src/configurable')

  return {
    __esModule: true,
    ...originalModule,
    getAxiosInstance: () => mockedAxios,
  }
})

const testFormDefinition = singleEndpointFormDefinition('/test/', {
  id: numberField(42),
  name: charField('foo', [notBlank]),
  images: arrayField(charField([notBlank])),
  users: arrayField(
    fieldSet(
      {
        name: charField(),
        pictures: arrayField({
          url: charField(),
        }),
        permissions: arrayField(charField()),
      },
      [testPictureValidator],
    ),
  ),
  address: {
    city: charField(),
    images: arrayField({
      url: charField(),
    }),
    inner: fieldSet({ photos: arrayField(charField()) }),
    documents: arrayField(charField()),
  },
})

describe('Single endpoint form definition test', () => {
  test('Test URL', () => {
    const url = testFormDefinition.url
    expect(url).toBe('/test/')
  })

  test('Test new', () => {
    const form = testFormDefinition.new()
    expect(form).toBeInstanceOf(SingleEndpointForm)
  })
})

describe('Single endpoint form', () => {
  test('Default data', () => {
    const form = testFormDefinition.new()
    expect(form.data.value).toStrictEqual({
      id: 42,
      name: 'foo',
      address: {
        city: '',
        documents: [],
        images: [],
        inner: {
          photos: [],
        },
      },
      images: [],
      users: [],
    })
  })

  test('No errors', () => {
    const form = testFormDefinition.new()
    expect(form.errors.value).toStrictEqual({
      id: [],
      name: [],
      address: {
        city: [],
        documents: new ArrayFieldErrors(),
        images: new ArrayFieldErrors(),
        inner: {
          non_field_errors: [],
          photos: new ArrayFieldErrors(),
        },
        non_field_errors: [],
      },
      images: new ArrayFieldErrors(),
      non_field_errors: [],
      users: new ArrayFieldErrors(),
    })
  })

  test('Form errors', () => {
    const form = testFormDefinition.new()
    form.data.value.name = ''
    form.data.value.images.push('')
    form.data.value.images.push('bar')
    form.data.value.images.push('')
    form.pushRelated('users')
    form.data.value.users[0].permissions.push('foobar')
    form.validate()
    const a = form.data.value
    expect(form.errors.value).toStrictEqual({
      id: [],
      name: ['Ez a mező nem lehet üres'],
      address: {
        city: [],
        documents: new ArrayFieldErrors(),
        images: new ArrayFieldErrors(),
        non_field_errors: [],
        inner: {
          non_field_errors: [],
          photos: new ArrayFieldErrors(),
        },
      },
      images: new ArrayFieldErrors(['Ez a mező nem lehet üres'], [], ['Ez a mező nem lehet üres']),
      non_field_errors: [],
      users: new ArrayFieldErrors({
        name: [],
        non_field_errors: ['Picture error'],
        permissions: new ArrayFieldErrors([]),
        pictures: new ArrayFieldErrors(),
      }),
    })
  })

  test('API errors', async () => {
    const error = {
      response: {
        data: {
          id: 'This is and ID error',
          name: 'This will be a name error',
          non_field_errors: 'This is an unrelated generic error',
        },
      },
    }
    mockedAxios.post.mockRejectedValue({
      response: {
        data: {
          id: ['Name error'],
          name: ['ID error'],
          non_field_errors: ['Non field error'],
          images: [[], ['Not valid image']],
          users: [
            {},
            {
              name: ['required'],
              pictures: [{}, { non_field_errors: ['inner picture'], url: ['url error'] }, {}],
              permissions: [[], ['required']],
              non_field_errors: ['non field inner'],
            },
          ],
          address: {
            city: ['Not good'],
            images: [{}, { url: ['invalid url'] }, { non_field_errors: ['Missing something'] }],
            non_field_errors: ['Invalid address'],
          },
        },
      },
    })

    const form = testFormDefinition.new()
    form.data.value.images.push('foo')
    form.data.value.images.push('bar')
    form.pushRelated('users')
    form.pushRelated('users')
    form.pushRelated('users.0.pictures', 1)
    form.pushRelated('users.0.pictures', 1)
    form.pushRelated('users.0.pictures', 1)
    form.data.value.users[1].permissions.push('a')
    form.data.value.users[1].permissions.push('b')

    form.pushRelated('address.images')
    form.pushRelated('address.images')
    form.pushRelated('address.images')

    await form.post()

    expect(form.apiErrors.value).toStrictEqual({
      'address.city': ['Not good'],
      'address.images.1.url': ['invalid url'],
      'address.images.2.non_field_errors': ['Missing something'],
      'address.non_field_errors': ['Invalid address'],
      id: ['Name error'],
      'images.0': [],
      'images.1': ['Not valid image'],
      name: ['ID error'],
      non_field_errors: ['Non field error'],
      'users.1.name': ['required'],
      'users.1.non_field_errors': ['non field inner'],
      'users.1.permissions.0': [],
      'users.1.permissions.1': ['required'],
      'users.1.pictures.1.non_field_errors': ['inner picture'],
      'users.1.pictures.1.url': ['url error'],
    })
    expect(form.errors.value).toStrictEqual({
      id: ['Name error'],
      name: ['ID error'],
      non_field_errors: ['Non field error'],
      address: {
        city: ['Not good'],
        documents: new ArrayFieldErrors(),
        images: new ArrayFieldErrors(
          { url: [], non_field_errors: [] },
          { url: ['invalid url'], non_field_errors: [] },
          { url: [], non_field_errors: ['Missing something'] },
        ),
        inner: {
          photos: new ArrayFieldErrors(),
          non_field_errors: [],
        },
        non_field_errors: ['Invalid address'],
      },
      images: new ArrayFieldErrors([], ['Not valid image']),
      users: new ArrayFieldErrors(
        {
          name: [],
          pictures: new ArrayFieldErrors(),
          permissions: new ArrayFieldErrors(),
          non_field_errors: [],
        },
        {
          name: ['required'],
          pictures: new ArrayFieldErrors(
            { url: [], non_field_errors: [] },
            { url: ['url error'], non_field_errors: ['inner picture'] },
            { url: [], non_field_errors: [] },
          ),
          permissions: new ArrayFieldErrors([], ['required']),
          non_field_errors: ['non field inner'],
        },
      ),
    })
  })
})
