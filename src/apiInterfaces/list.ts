import { type Ref, type ComputedRef, ref, watch, computed } from 'vue'
import { getAxiosInstance, showErrorNotificationToast } from '../configurable'
import { type FieldSetRaw, type FieldSetData, FieldBase, FieldSet } from '../fields'

import { getURLSearchParamsSize } from './utils'
import { Paginator, DEFAULT_PAGE_SIZE } from './paginator'
import type { CallbackFunction, APIUrl } from './types'

// Type definitions
type FilterOptions<T extends FieldSetRaw> = {
  [key in keyof T]: T[key] extends FieldBase<any> ? ReturnType<T[key]['toNative']> | null : never
}
type FilterOptionsValueType<T extends FieldSetRaw, K extends keyof T> = T[K] extends FieldBase<any>
  ? ReturnType<T[K]['toNative']> | null
  : never

type ListApiResponse<T> = T[]
type PaginatedListApiResponse<T> = {
  data: ListApiResponse<T>[]
  total: number
}

type ModelListSelector<T extends boolean, FS extends FieldSetRaw, FFS extends FieldSetRaw> = T extends true
  ? PaginatedModelList<FS, FFS>
  : ModelList<FS, FFS>

type ListExtraMethodDefinitions<T extends ModelList<any, any>> = {
  [key: string]: (this: T, ...args: any[]) => any
}

type ListExtraMethods<LT extends ModelList<any, any>, EMD extends ListExtraMethodDefinitions<LT>> = {
  [key in keyof EMD]: (..._args: Parameters<EMD[key]>) => ReturnType<EMD[key]>
}

// Preservation infos
interface PreservedPaginatorInfo {
  currentPage: number
  maxPage: number
}

const preservedFilters = ref<Record<string, any>>({})
const preservedSearchTexts = ref<Record<string, string>>({})
const preservedPaginationInfo = ref<Record<string, PreservedPaginatorInfo>>({})

function getPreservedFilters<T>(key: string): Partial<FilterOptionsFrom<T>> | null {
  return key in preservedFilters.value ? preservedFilters.value[key] : {}
}

function getPreservedSearchText(key: string): string {
  return key in preservedSearchTexts.value ? preservedSearchTexts.value[key] : ''
}

function getPreservedPaginatorInfo(key: string): PreservedPaginatorInfo {
  return key in preservedPaginationInfo.value
    ? preservedPaginationInfo.value[key]
    : { currentPage: 1, maxPage: DEFAULT_PAGE_SIZE }
}

export const preserveListOptions = <T extends ModelListInstance>(key: string, list: T) => {
  // Filtering
  watch(
    () => list.filterOptions.value,
    () => {
      preservedFilters.value[key] = list.filterOptions.value
    },
    {
      immediate: true,
      deep: true,
    },
  )

  // Search
  watch(
    () => list.searchText.value,
    () => {
      preservedSearchTexts.value[key] = list.searchText.value
    },
    {
      immediate: true,
      deep: true,
    },
  )

  // Pagination
  if (list instanceof PaginatedModelList) {
    watch(
      () => list.paginator.currentPage,
      () => {
        preservedPaginationInfo.value[key] = {
          currentPage: list.paginator.currentPage.value,
          maxPage: list.paginator.maxPage.value,
        }
      },
      {
        immediate: true,
        deep: true,
      },
    )
  }
}

// Classes
export class ModelListDefinition<
  FS extends FieldSetRaw,
  P extends boolean = false,
  FOFS extends FieldSetRaw = Record<string, FieldBase<any>>,
  EMD extends ListExtraMethodDefinitions<ModelListSelector<P, FS, FOFS>> = Record<
    string,
    (this: ModelListSelector<P, FS, FOFS>, ...args: any[]) => any
  >,
> {
  readonly url: APIUrl
  readonly isPaginated: boolean
  readonly fieldSet: FieldSet<FS>
  readonly filterOptionsFieldSet: FieldSet<FOFS>
  readonly extraMethods: EMD

  constructor(url: APIUrl, rawFieldSet: FS, isPaginated?: P, filterOptionsFieldSet?: FOFS, extraMethods?: EMD) {
    this.url = url
    this.isPaginated = !!isPaginated
    this.fieldSet = new FieldSet<FS>(rawFieldSet)

    if (!filterOptionsFieldSet) filterOptionsFieldSet = {} as FOFS
    this.filterOptionsFieldSet = new FieldSet<FOFS>(filterOptionsFieldSet)

    if (!extraMethods) extraMethods = {} as EMD
    this.extraMethods = extraMethods
  }

  new(
    filterOptions?: Partial<FilterOptions<FOFS>>,
    searchText?: string,
    currentPage?: number, // TODO make this visible in signature based on if paginated or not
  ): ModelListSelector<P, FS, FOFS> & ListExtraMethods<ModelListSelector<P, FS, FOFS>, EMD> {
    let filterOptionsDefault = this.filterOptionsFieldSet.getDefault()
    if (filterOptions) filterOptionsDefault = Object.assign(filterOptionsDefault, filterOptions)

    if (!searchText) searchText = ''
    if (!currentPage) currentPage = 1
    let list: ModelListType
    if (this.isPaginated) {
      list = new PaginatedModelList<FS, FOFS>(
        this,
        filterOptionsDefault as FilterOptions<FOFS>,
        searchText,
        currentPage,
      )
    } else {
      list = new ModelList<FS, FOFS>(this, filterOptionsDefault as FilterOptions<FOFS>, searchText)
    }
    return list as ModelListSelector<P, FS, FOFS> & ListExtraMethods<ModelListSelector<P, FS, FOFS>, EMD>
  }

  fetchNew(
    filterOptions?: Partial<FilterOptions<FOFS>>,
    searchText?: string,
    currentPage?: number,
  ): ModelListSelector<P, FS, FOFS> & ListExtraMethods<ModelListSelector<P, FS, FOFS>, EMD> {
    const list = this.new(filterOptions, searchText, currentPage)
    list.fetch()
    return list
  }

  preserveOptionsAs(key: string): ModelListInfoPreservationWrapper<FS, P, FOFS, EMD> {
    return new ModelListInfoPreservationWrapper(this, key)
  }
}

class ModelListInfoPreservationWrapper<
  FS extends FieldSetRaw,
  P extends boolean,
  FOFS extends FieldSetRaw,
  EMD extends ListExtraMethodDefinitions<ModelListSelector<P, FS, FOFS>>,
> {
  readonly listDefinition: ModelListDefinition<FS, boolean, FOFS, ListExtraMethodDefinitions<any>>
  readonly key: string

  constructor(listDefinition: ModelListDefinition<FS, boolean, FOFS, ListExtraMethodDefinitions<any>>, key: string) {
    this.listDefinition = listDefinition
    this.key = key
  }

  new(
    filterOptions?: Partial<FilterOptions<FOFS>>,
    searchText?: string,
  ): ReturnType<ModelListDefinition<FS, P, FOFS, EMD>['new']> {
    filterOptions = Object.assign({}, getPreservedFilters(this.key), filterOptions || {})
    searchText = searchText || getPreservedSearchText(this.key)
    const currentPage = getPreservedPaginatorInfo(this.key).currentPage

    const list = this.listDefinition.new(filterOptions, searchText, currentPage) as ReturnType<
      ModelListDefinition<FS, P, FOFS, EMD>['new']
    >
    preserveListOptions(this.key, list)
    return list
  }

  fetchNew(
    filterOptions?: Partial<FilterOptions<FOFS>>,
    searchText?: string,
  ): ReturnType<ModelListDefinition<FS, P, FOFS, EMD>['fetchNew']> {
    filterOptions = Object.assign({}, getPreservedFilters(this.key), filterOptions || {})
    searchText = searchText || getPreservedSearchText(this.key)
    const currentPage = getPreservedPaginatorInfo(this.key).currentPage

    const list = this.listDefinition.fetchNew(filterOptions, searchText, currentPage) as ReturnType<
      ModelListDefinition<FS, P, FOFS, EMD>['fetchNew']
    >
    preserveListOptions(this.key, list)
    return list
  }
}

export class ModelList<FS extends FieldSetRaw, FOFS extends FieldSetRaw> {
  readonly definition: ModelListDefinition<FS, boolean, FOFS, ListExtraMethodDefinitions<any>>
  readonly entities: Ref<FieldSetData<FS>[]>
  readonly searchText: Ref<string>
  readonly filterOptions: Ref<FilterOptions<FOFS>>
  readonly hasActiveFilterOption: ComputedRef<boolean>

  protected readonly postFetchCallbacks: CallbackFunction[]

  constructor(
    listDefinition: ModelListDefinition<FS, boolean, FOFS, ListExtraMethodDefinitions<any>>,
    filterOptions: FilterOptions<FOFS>,
    searchText: string,
  ) {
    this.definition = listDefinition
    this.entities = ref([])
    this.searchText = ref(searchText)
    this.filterOptions = ref(filterOptions) as Ref<FilterOptions<FOFS>>
    this.hasActiveFilterOption = computed(() => this._hasActiveFilterOption())

    const temp: Record<string, () => void> = {}
    for (const methodName in this.definition.extraMethods) {
      temp[methodName] = (...args) => {
        return this.definition.extraMethods[methodName].apply(this, args)
      }
    }
    Object.assign(this, temp)

    this.postFetchCallbacks = []

    watch(
      () => this.filterOptions,
      () => {
        this._filterOptionsChangeCallback()
      },
      { deep: true },
    )
  }

  _filterOptionsChangeCallback(): void {
    this.fetch()
  }

  _hasActiveFilterOption(): boolean {
    for (const [key, value] of Object.entries(this.filterOptions.value)) {
      if (Array.isArray(value)) {
        if (value.length > 0) return true
      } else if (value) return true
    }
    return false
  }

  _getBaseURL(): string {
    if (this.definition.url instanceof Function) return this.definition.url()
    return this.definition.url
  }

  postFetch(func: CallbackFunction) {
    this.postFetchCallbacks.push(func)
  }

  setSearchText(searchText: string): void {
    this.searchText.value = searchText
  }

  setFilterOptions(filterOptions: Partial<FilterOptions<FOFS>>): void {
    Object.assign(this.filterOptions.value, filterOptions)
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
      if (!value) continue
      if (Array.isArray(value)) {
        if (value.length === 0) continue

        value.forEach((v) => queryParams.append(key, v))
      } else {
        queryParams.append(key, value)
      }
    }
    return queryParams
  }

  async fetch(): Promise<ModelList<FS, FOFS>> {
    const queryParams = this.getQueryParams()
    let url = this._getBaseURL()
    if (getURLSearchParamsSize(queryParams) > 0) {
      url += `?${queryParams.toString()}`
    }

    const api = getAxiosInstance()
    return api
      .get<ListApiResponse<FieldSetData<FS>>>(url)
      .then((response) => {
        this.entities.value = response.data.map((d) => this.definition.fieldSet.toNative(d))
        this.postFetchCallbacks.forEach((func) => func(true))
        return this
      })
      .catch(() => {
        showErrorNotificationToast('Hiba a betöltés közben')
        this.postFetchCallbacks.forEach((func) => func(false))
        return this
      })
  }

  reset() {
    this.entities.value = []
  }
}

export class PaginatedModelList<FS extends FieldSetRaw, FOFS extends FieldSetRaw> extends ModelList<FS, FOFS> {
  readonly paginator: Paginator

  constructor(
    listDefinition: ModelListDefinition<FS, boolean, FOFS, ListExtraMethodDefinitions<any>>,
    filterOptions: FilterOptions<FOFS>,
    searchText: string,
    currentPage: number,
  ) {
    super(listDefinition, filterOptions, searchText)
    this.paginator = new Paginator(currentPage)
    this.paginator.onChange(() => {
      this.fetch()
    })
  }

  _filterOptionsChangeCallback() {
    if (this.paginator.currentPage.value === 1) {
      super._filterOptionsChangeCallback()
    } else {
      this.paginator.setPage(1)
    }
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
    let url = this._getBaseURL()
    if (getURLSearchParamsSize(queryParams) > 0) {
      url += `?${queryParams.toString()}`
    }

    const api = getAxiosInstance()
    return api
      .get<PaginatedListApiResponse<FieldSetData<FS>>>(url)
      .then((response) => {
        this.entities.value = response.data.data.map((d) => this.definition.fieldSet.toNative(d))
        this.paginator.setTotal(response.data.total)
        this.postFetchCallbacks.forEach((func) => func(true))
        return this
      })
      .catch(() => {
        showErrorNotificationToast('Hiba a betöltés közben')
        this.postFetchCallbacks.forEach((func) => func(false))
        return this
      })
  }
}

export type ModelListInstance<
  T extends ModelListDefinition<any, any, any, any> = ModelListDefinition<any, any, any, any>,
> = T extends ModelListDefinition<infer FS, infer P, infer FFS, infer EMD>
  ? P extends true
    ? PaginatedModelList<FS, FFS> & ListExtraMethods<ModelListSelector<P, FS, FFS>, EMD>
    : ModelList<FS, FFS> & ListExtraMethods<ModelListSelector<P, FS, FFS>, EMD>
  : never
export type ModelListType = InstanceType<typeof ModelList> | InstanceType<typeof PaginatedModelList>
export type FilterOptionsFrom<T> = T extends ModelListDefinition<any, any, infer R, any> ? Ref<FieldSetData<R>> : never

export function modelListDefinition<
  FS extends FieldSetRaw,
  P extends boolean = false,
  FFS extends FieldSetRaw = {},
  EMD extends ListExtraMethodDefinitions<ModelListSelector<P, FS, FFS>> = {},
>(url: APIUrl, rawFieldSet: FS, isPaginated?: P, filterOptionsFieldSet?: FFS, extraMethods?: EMD) {
  return new ModelListDefinition(url, rawFieldSet, isPaginated, filterOptionsFieldSet, extraMethods)
}
