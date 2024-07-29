import axios from 'axios'
import { charField, notBlank, numberField, crudApiFormDefinition } from '../../src'
import { CrudApiForm } from '../../src/apiInterfaces/crud'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>
jest.mock('../../src/axios', () => {
  const originalModule = jest.requireActual('../../src/axios')

  return {
    __esModule: true,
    ...originalModule,
    getAxiosInstance: () => mockedAxios,
  }
})

function testExtraMethod<T extends CrudApiForm<{ id: ReturnType<typeof numberField> }>>(this: T): string {
  return `Id is ${this.data.value.id}`
}

const testFormDefinition = crudApiFormDefinition(
  '/test/',
  {
    id: numberField(42),
    name: charField('foo', [notBlank]),
  },
  {
    testExtraMethod,
  },
)

describe('CRUD endpoint form test', () => {
  test('Test create URL', async () => {
    mockedAxios.post.mockResolvedValue({
      id: 1,
      name: 'foo',
    })

    const testForm = testFormDefinition.new({ id: 1, name: 'foo' })
    await testForm.create()
    expect(mockedAxios.post.mock.calls).toHaveLength(1)
    expect(mockedAxios.post.mock.calls[0][0]).toBe('/test/')
  })

  test('Test fetch URL', async () => {
    mockedAxios.get.mockResolvedValue({
      id: 1,
      name: 'foo',
    })

    testFormDefinition.fetch(1)
    await new Promise((resolve) => resolve({}))
    expect(mockedAxios.get.mock.calls).toHaveLength(1)
    expect(mockedAxios.get.mock.calls[0][0]).toBe('/test/1/')
  })

  test('Test update URL', async () => {
    mockedAxios.put.mockResolvedValue({
      id: 1,
      name: 'foo',
    })

    const testForm = testFormDefinition.fetch(1)
    await testForm.update()
    expect(mockedAxios.put.mock.calls).toHaveLength(1)
    expect(mockedAxios.put.mock.calls[0][0]).toBe('/test/1/')
  })

  test('Test delete URL', async () => {
    mockedAxios.delete.mockResolvedValue({})

    const testForm = testFormDefinition.fetch(1)
    await testForm.delete()
    expect(mockedAxios.delete.mock.calls).toHaveLength(1)
    expect(mockedAxios.delete.mock.calls[0][0]).toBe('/test/1/')
  })

  test('Test new', () => {
    const testForm = testFormDefinition.new()
    expect(testForm).toBeInstanceOf(CrudApiForm)
  })

  test('Extra method', () => {
    const testForm = testFormDefinition.new()
    const value = testForm.testExtraMethod()
    expect(value).toBe('Id is 42')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
