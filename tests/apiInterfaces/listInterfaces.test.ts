import axios from 'axios'
import { charField, numberField } from '../../src'
import { modelListDefinition, ModelListType } from '../../src/apiInterfaces/list'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
jest.mock('../../src/configurable', () => {
  const originalModule = jest.requireActual('../../src/configurable')

  return {
    __esModule: true,
    ...originalModule,
    getAxiosInstance: () => mockedAxios,
  }
})

function testExtraMethod<T extends ModelListType>(this: T): string {
  return `Length of list is ${this.entities.value.length}`
}

const testModelListDefinition = modelListDefinition(
  '/test/',
  {
    id: numberField(),
    name: charField(),
  },
  false,
  {
    name: charField(),
    age: numberField(),
  },
  {
    testExtraMethod,
    inlineExtraMethod: function (firstName: string) {
      this
    },
  },
)

const testPaginatedModelListDefinition = modelListDefinition(
  '/test/paginated/',
  {
    id: numberField(),
    name: charField(),
  },
  true,
  {
    name: charField(),
    age: numberField(),
  },
  {
    testExtraMethod,
  },
)

describe('Model list', () => {
  test('New list', () => {
    const modelList = testModelListDefinition.new()
    expect(modelList.entities.value).toStrictEqual([])
    expect(modelList.searchText.value).toBe('')
    expect(modelList.filterOptions.value).toStrictEqual({ age: 0, name: '' })
  })

  test('Fetch list', async () => {
    const modelList = testModelListDefinition.fetchNew()
    await new Promise((resolve) => resolve({}))
    expect(modelList.entities.value).toStrictEqual([])
    expect(modelList.searchText.value).toBe('')
    expect(modelList.filterOptions.value).toStrictEqual({ age: 0, name: '' })
  })

  test('Search string', async () => {
    const modelList = testModelListDefinition.new()
    modelList.setSearchText('foobar')
    await modelList.fetch()
    expect(mockedAxios.get.mock.calls).toHaveLength(1)
    expect(mockedAxios.get.mock.calls[0][0]).toBe('/test/?q=foobar')

    modelList.setSearchText('')
    await modelList.fetch()
    expect(mockedAxios.get.mock.calls).toHaveLength(2)
    expect(mockedAxios.get.mock.calls[1][0]).toBe('/test/')
  })

  test('Filtering', async () => {
    const modelList = testModelListDefinition.new()
    modelList.setFilterOption('name', 'foo')
    expect(mockedAxios.get.mock.calls).toHaveLength(1)
    expect(mockedAxios.get.mock.calls[0][0]).toBe('/test/?name=foo')

    modelList.setFilterOption('age', 42)
    expect(mockedAxios.get.mock.calls).toHaveLength(2)
    expect(mockedAxios.get.mock.calls[1][0]).toBe('/test/?name=foo&age=42')

    modelList.setFilterOption('name', null)
    modelList.setFilterOption('age', null)
    expect(mockedAxios.get.mock.calls).toHaveLength(4)
    expect(mockedAxios.get.mock.calls[2][0]).toBe('/test/')
  })

  test('Filtering and search', async () => {
    const modelList = testModelListDefinition.new()
    modelList.setFilterOption('name', 'foo')
    modelList.setFilterOption('age', 42)
    modelList.setSearchText('bar')
    expect(mockedAxios.get.mock.calls).toHaveLength(3)
    expect(mockedAxios.get.mock.calls[0][0]).toBe('/test/?q=bar&name=foo&age=42')
  })

  test('Extra method', async () => {
    mockedAxios.get.mockResolvedValue({
      data: [
        { id: 1, name: 'foo' },
        { id: 2, name: 'foo' },
      ],
    })

    const modelList = testModelListDefinition.new()
    await modelList.fetch()
    const value = modelList.testExtraMethod()
    expect(value).toBe('Length of list is 2')
  })

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: [],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

describe('Paginated model list', () => {
  test('New list', () => {
    const modelList = testPaginatedModelListDefinition.new()
    expect(modelList.entities.value).toStrictEqual([])
    expect(modelList.searchText.value).toBe('')
    expect(modelList.filterOptions.value).toStrictEqual({ age: 0, name: '' })
    expect(modelList.paginator.total.value).toBe(0)
    expect(modelList.paginator.pageSize.value).toBe(25)
    expect(modelList.paginator.currentPage.value).toBe(1)
  })

  test('Fetch list', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: [
          { id: 0, name: 'foo' },
          { id: 0, name: 'foo' },
          { id: 0, name: 'foo' },
          { id: 0, name: 'foo' },
        ],
        total: 4,
      },
    })

    const modelList = testPaginatedModelListDefinition.fetchNew()
    await new Promise((resolve) => resolve({}))
    expect(mockedAxios.get.mock.calls).toHaveLength(1)
    expect(modelList.entities.value).toStrictEqual([
      { id: 0, name: 'foo' },
      { id: 0, name: 'foo' },
      { id: 0, name: 'foo' },
      { id: 0, name: 'foo' },
    ])
    expect(modelList.searchText.value).toBe('')
    expect(modelList.filterOptions.value).toStrictEqual({ age: 0, name: '' })
    expect(modelList.paginator.total.value).toBe(4)
    expect(modelList.paginator.pageSize.value).toBe(25)
    expect(modelList.paginator.currentPage.value).toBe(1)
    expect(modelList.paginator.maxPage.value).toBe(1)
  })

  test('Paginator', async () => {
    const modelList = testPaginatedModelListDefinition.new()
    modelList.paginator.pageSize.value = 2

    mockedAxios.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'foo' },
          { id: 2, name: 'foo' },
        ],
        total: 4,
      },
    })

    await modelList.fetch()
    expect(modelList.entities.value).toStrictEqual([
      { id: 1, name: 'foo' },
      { id: 2, name: 'foo' },
    ])
    expect(modelList.paginator.total.value).toBe(4)
    expect(modelList.paginator.pageSize.value).toBe(2)
    expect(modelList.paginator.currentPage.value).toBe(1)
    expect(modelList.paginator.maxPage.value).toBe(2)

    mockedAxios.get.mockResolvedValue({
      data: {
        data: [
          { id: 3, name: 'foo' },
          { id: 4, name: 'foo' },
        ],
        total: 4,
      },
    })
    modelList.paginator.nextPage()
    await new Promise((resolve) => resolve({}))
    expect(mockedAxios.get.mock.calls).toHaveLength(2)
    expect(mockedAxios.get.mock.calls[1][0]).toBe('/test/paginated/?page=2&page_size=2')
    expect(modelList.entities.value).toStrictEqual([
      { id: 3, name: 'foo' },
      { id: 4, name: 'foo' },
    ])
    expect(modelList.paginator.total.value).toBe(4)
    expect(modelList.paginator.pageSize.value).toBe(2)
    expect(modelList.paginator.currentPage.value).toBe(2)
    expect(modelList.paginator.maxPage.value).toBe(2)
  })

  test('Search string', async () => {
    const modelList = testPaginatedModelListDefinition.new()
    modelList.setSearchText('foobar')
    await modelList.fetch()
    expect(mockedAxios.get.mock.calls).toHaveLength(1)
    expect(mockedAxios.get.mock.calls[0][0]).toBe('/test/paginated/?q=foobar')

    modelList.setSearchText('')
    await modelList.fetch()
    expect(mockedAxios.get.mock.calls).toHaveLength(2)
    expect(mockedAxios.get.mock.calls[1][0]).toBe('/test/paginated/')
  })

  test('Filtering', async () => {
    const modelList = testPaginatedModelListDefinition.new()
    modelList.setFilterOption('name', 'foo')
    await modelList.fetch()
    expect(mockedAxios.get.mock.calls).toHaveLength(1)
    expect(mockedAxios.get.mock.calls[0][0]).toBe('/test/paginated/?name=foo')

    modelList.setFilterOption('age', 42)
    await modelList.fetch()
    expect(mockedAxios.get.mock.calls).toHaveLength(2)
    expect(mockedAxios.get.mock.calls[1][0]).toBe('/test/paginated/?name=foo&age=42')

    modelList.setFilterOption('name', null)
    modelList.setFilterOption('age', null)
    await modelList.fetch()
    expect(mockedAxios.get.mock.calls).toHaveLength(3)
    expect(mockedAxios.get.mock.calls[2][0]).toBe('/test/paginated/')
  })

  test('Filtering and search', async () => {
    const modelList = testPaginatedModelListDefinition.new()
    modelList.setFilterOption('name', 'foo')
    modelList.setFilterOption('age', 42)
    modelList.setSearchText('bar')
    await modelList.fetch()
    expect(mockedAxios.get.mock.calls).toHaveLength(1)
    expect(mockedAxios.get.mock.calls[0][0]).toBe('/test/paginated/?q=bar&name=foo&age=42')
  })

  test('Extra method', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'foo' },
          { id: 2, name: 'foo' },
        ],
        total: 2,
      },
    })

    const modelList = testPaginatedModelListDefinition.new()
    await modelList.fetch()
    const value = modelList.testExtraMethod()
    expect(value).toBe('Length of list is 2')
  })

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: [],
        total: 0,
      },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
