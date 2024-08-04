import axios from 'axios'
import { charField, fieldSet, modelListDefinition, numberField } from '../../src'

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

const APIPayload = {
  total: 6,
  data: [
    {
      id: 5,
      name: 'AA-AW-677 - Peugeot Boxer',
      owner: null,
      drivers: [
        {
          id: 8,
          name: '01 Boros Attila',
        },
        {
          id: 5,
          name: '01 Bukucs Zoltán',
        },
        {
          id: 6,
          name: '01 Hámori Béla',
        },
        {
          id: 3,
          name: '01 Kecskés Attila',
        },
        {
          id: 2,
          name: '01 Takács László',
        },
        {
          id: 9,
          name: '01 Turjánszky Zoltán',
        },
        {
          id: 4,
          name: '03 Fehér Adrián',
        },
        {
          id: 7,
          name: '04 Parditka Zoltán',
        },
        {
          id: 33,
          name: '05 Tóth Attila',
        },
      ],
      institution_owned: true,
    },
    {
      id: 6,
      name: 'JPJ-540 - Opel Astra',
      owner: {
        id: 7,
        name: '04 Parditka Zoltán',
      },
      drivers: [],
      institution_owned: false,
    },
    {
      id: 9,
      name: 'KEP-945 - Mazda 3 1.4 sport',
      owner: {
        id: 5,
        name: '01 Bukucs Zoltán',
      },
      drivers: [],
      institution_owned: false,
    },
    {
      id: 8,
      name: 'RGD-696 - Toyota Avensis',
      owner: {
        id: 6,
        name: '01 Hámori Béla',
      },
      drivers: [],
      institution_owned: false,
    },
    {
      id: 7,
      name: 'RGM-953 - Volkswagen Touran',
      owner: {
        id: 3,
        name: '01 Kecskés Attila',
      },
      drivers: [],
      institution_owned: false,
    },
    {
      id: 4,
      name: 'RYM-890 - AUDI A6',
      owner: {
        id: 2,
        name: '01 Takács László',
      },
      drivers: [],
      institution_owned: false,
    },
  ],
}

export const carListDefinition = modelListDefinition(
  '/api/cars/',
  {
    id: numberField(),
    name: charField(),
    owner: fieldSet(
      {
        id: numberField(),
        name: charField(),
      },
      true,
    ),
  },
  true,
)

describe('Test car list', () => {
  test('Fetching', async () => {
    const modelList = carListDefinition.fetchNew()
    await new Promise((resolve) => resolve({}))

    expect(modelList.entities.value).toHaveLength(6)
    expect(modelList.entities.value).toStrictEqual(APIPayload.data)
    expect(modelList.searchText.value).toBe('')
    expect(modelList.filterOptions.value).toStrictEqual({})
    expect(modelList.paginator.total.value).toBe(6)
  })
})

beforeEach(() => {
  mockedAxios.get.mockResolvedValue({
    data: APIPayload,
  })
})

afterEach(() => {
  jest.clearAllMocks()
})
