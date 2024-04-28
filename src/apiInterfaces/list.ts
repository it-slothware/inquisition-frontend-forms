import { type Ref, ref } from 'vue'
import { $api } from '@/plugins/axiosPlugin'

import { getURLSearchParamsSize } from './utils'
import { Paginator, DEFAULT_PAGE_SIZE } from './paginator'
import { type ModelFieldSetRaw, type ModelData, ModelFieldSet, FieldBase } from './fields'

// Type definitions
type FilterOptions<T extends ModelFieldSetRaw> = {
  [key in keyof T]: T[key] extends FieldBase<any> ? ReturnType<T[key]['toNative']> : never
}
type FilterOptionsValueType<T extends ModelFieldSetRaw, K extends keyof T> = T[K] extends FieldBase<any>
  ? ReturnType<T[K]['toNative']>
  : never

type ListApiResponse<T> = T[]
type PaginatedListApiResponse<T> = {
  data: ListApiResponse<T>[]
  total: number
}

type ModelListSelector<T extends boolean, FS extends ModelFieldSetRaw, FOFS extends ModelFieldSetRaw> = T extends true
  ? PaginatedModelList<FS, FOFS>
  : ModelList<FS, FOFS>

type ExtraMethodDefinitions<LT extends ModelList<any, any>> = {
  [key: string]: (this: LT, ...args: any[]) => any
}

type ExtraMethods<LT extends ModelList<any, any>, EMD extends ExtraMethodDefinitions<LT>> = {
  [key in keyof EMD]: (...args: Parameters<EMD[key]>) => ReturnType<EMD[key]>
}

// Classes
export class ModelListDefinition<
  T extends string,
  P extends boolean,
  FS extends ModelFieldSetRaw,
  FOFS extends ModelFieldSetRaw,
  EMD extends ExtraMethodDefinitions<ModelListSelector<P, FS, FOFS>>,
> {
  readonly url: string
  readonly isPaginated: boolean
  readonly fieldSet: ModelFieldSet<FS>
  readonly filterOptionsFieldSet: ModelFieldSet<FOFS>
  readonly extraMethods: EMD

  constructor(url: T, isPaginated: P, rawFieldSet: FS, filterOptionsFieldSet?: FOFS, extraMethods?: EMD) {
    this.url = url
    this.isPaginated = isPaginated
    this.fieldSet = new ModelFieldSet(rawFieldSet)

    if (!filterOptionsFieldSet) filterOptionsFieldSet = {} as FOFS
    this.filterOptionsFieldSet = new ModelFieldSet(filterOptionsFieldSet)

    if (!extraMethods) extraMethods = {} as EMD
    this.extraMethods = extraMethods
  }

  new(
    filterOptions?: Partial<FilterOptions<FOFS>>,
    searchText?: string,
  ): ModelListSelector<P, FS, FOFS> & ExtraMethods<ModelListSelector<P, FS, FOFS>, EMD> {
    if (!filterOptions) filterOptions = {} as FilterOptions<FOFS>
    if (!searchText) searchText = ''
    let list: any
    if (this.isPaginated) {
      list = new PaginatedModelList<FS, FOFS>(this, filterOptions as FilterOptions<FOFS>, searchText)
    } else {
      list = new ModelList<FS, FOFS>(this, filterOptions as FilterOptions<FOFS>, searchText)
    }
    return list as ModelListSelector<P, FS, FOFS> & ExtraMethods<ModelListSelector<P, FS, FOFS>, EMD>
  }

  fetchNew(
    filterOptions?: Partial<FilterOptions<FOFS>>,
    searchText?: string,
  ): ModelListSelector<P, FS, FOFS> & ExtraMethods<ModelListSelector<P, FS, FOFS>, EMD> {
    const list = this.new(filterOptions, searchText)
    list.fetch()
    return list
  }
}

class ModelList<FS extends ModelFieldSetRaw, FOFS extends ModelFieldSetRaw> {
  readonly definition: ModelListDefinition<string, boolean, FS, FOFS, ExtraMethodDefinitions<any>>
  readonly entities: Ref<ModelData<FS>[]>
  readonly searchText: Ref<string>
  readonly filterOptions: Ref<FilterOptions<FOFS>>

  constructor(
    listDefinition: ModelListDefinition<string, boolean, FS, FOFS, ExtraMethodDefinitions<any>>,
    filterOptions: FilterOptions<FOFS>,
    searchText: string,
  ) {
    this.definition = listDefinition
    this.entities = ref([])
    this.searchText = ref(searchText)
    this.filterOptions = ref(filterOptions) as Ref<FilterOptions<FOFS>>

    const temp: Record<string, () => void> = {}
    for (const methodName in this.definition.extraMethods) {
      temp[methodName] = (...args) => {
        return this.definition.extraMethods[methodName].apply(this, args)
      }
    }
    Object.assign(this, temp)
  }

  setSearchText(searchText: string): void {
    this.searchText.value = searchText
  }

  setFilterOptions(filterOptions: FilterOptions<FOFS>): void {
    this.filterOptions.value = filterOptions
  }

  setFilterOption<K extends keyof FilterOptions<FOFS>>(optionKey: K, value: FilterOptionsValueType<FOFS, K>): void {
    this.filterOptions.value[optionKey] = value
  }

  getQueryParams(): URLSearchParams {
    const queryParams = new URLSearchParams()
    if (this.searchText.value !== '') {
      queryParams.append('q', this.searchText.value)
    }
    for (const [key, value] of Object.entries(this.filterOptions.value)) {
      queryParams.append(key, value)
    }
    return queryParams
  }

  async fetch(): Promise<ModelList<FS, FOFS>> {
    const queryParams = this.getQueryParams()
    const url =
      getURLSearchParamsSize(queryParams) > 0 ? `${this.definition.url}?${queryParams.toString()}` : this.definition.url

    return $api.get<ListApiResponse<ModelData<FS>>>(url).then((response) => {
      this.entities.value = response.data.map((d) => this.definition.fieldSet.toNative(d))
      return this
    })
  }
}

class PaginatedModelList<FS extends ModelFieldSetRaw, FOFS extends ModelFieldSetRaw> extends ModelList<FS, FOFS> {
  readonly paginator: Paginator

  constructor(
    listDefinition: ModelListDefinition<string, boolean, FS, FOFS, ExtraMethodDefinitions<any>>,
    filterOptions: FilterOptions<FOFS>,
    searchText: string,
  ) {
    super(listDefinition, filterOptions, searchText)
    this.paginator = new Paginator()
    this.paginator.onChange(() => {
      this.fetch().catch(() => {
        // TODO implement error notifications
      })
    })
  }

  getQueryParams(): URLSearchParams {
    const queryParams = super.getQueryParams()
    if (this.paginator.currentPage.value > 1) {
      queryParams.append('page', this.paginator.currentPage.value.toString())
    }
    if (this.paginator.pageSize.value !== DEFAULT_PAGE_SIZE) {
      queryParams.append('page_size', this.paginator.pageSize.value.toString())
    }
    return queryParams
  }

  async fetch(): Promise<ModelList<FS, FOFS>> {
    const queryParams = this.getQueryParams()
    const url =
      getURLSearchParamsSize(queryParams) > 0 ? `${this.definition.url}?${queryParams.toString()}` : this.definition.url

    return $api.get<PaginatedListApiResponse<ModelData<FS>>>(url).then((response) => {
      this.entities.value = response.data.data.map((d) => this.definition.fieldSet.toNative(d))
      this.paginator.setTotal(response.data.total)
      return this
    })
  }
}

export type ModelListType = InstanceType<typeof ModelList> | InstanceType<typeof PaginatedModelList>
export type ModelDataFrom<T> = T extends ModelListDefinition<any, any, infer R, any, any> ? ModelData<R> : never
export type FilterOptionsFrom<T> = T extends ModelListDefinition<any, any, any, infer R, any>
  ? Ref<ModelData<R>>
  : never
