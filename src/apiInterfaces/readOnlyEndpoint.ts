import type { APIResponseNotifications, APIUrl, CallbackFunction, RecursivePartial } from './types'
import { getAxiosInstance, showErrorNotificationToast } from '../configurable'
import { type FieldSetRaw, type FieldSetData, FieldBase } from '../fields'
import { BaseApiForm, BaseApiFormDefinition, QueryParams } from './base'

interface ReadOnlyEndpointFormConfiguration {
  getNotifications: APIResponseNotifications
}

const readOnlyEndpointFormDefaultConfiguration: ReadOnlyEndpointFormConfiguration = {
  getNotifications: {
    success: '',
    failure: 'Hiba a betöltés közben',
  },
}

export class ReadOnlyEndpointFormDefinition<
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
> extends BaseApiFormDefinition<FS, QPFS> {
  readonly url: APIUrl
  readonly config: ReadOnlyEndpointFormConfiguration

  constructor(
    url: APIUrl,
    rawFieldSet: FS,
    queryParams?: QPFS,
    config?: RecursivePartial<ReadOnlyEndpointFormConfiguration>,
  ) {
    super(url, rawFieldSet, queryParams)
    this.url = url
    this.config = Object.assign(JSON.parse(JSON.stringify(readOnlyEndpointFormDefaultConfiguration)), config)
  }

  new(initialData?: Partial<FieldSetData<FS>>): ReadOnlyEndpointForm<FS, QPFS> {
    if (!initialData) initialData = {}
    return new ReadOnlyEndpointForm<FS, QPFS>(this, this.fieldSet.toNative(initialData))
  }
}

export class ReadOnlyEndpointForm<
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
> extends BaseApiForm<FS, QPFS> {
  readonly definition: ReadOnlyEndpointFormDefinition<FS>

  private readonly postGetCallbacks: CallbackFunction[]

  constructor(formDefinition: ReadOnlyEndpointFormDefinition<FS>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.data.value = this.definition.fieldSet.toNative(data)

    this.postGetCallbacks = []
  }

  postGet(func: CallbackFunction) {
    this.postGetCallbacks.push(func)
  }

  get(queryParams?: Partial<QueryParams<QPFS>>, urlParams?: any[]) {
    if (queryParams) {
      this.setQueryParams(queryParams)
    }

    const api = getAxiosInstance()
    return api
      .get(this.getApiURL(urlParams))
      .then((response) => {
        this.data.value = this.definition.fieldSet.toNative(response.data)
        this.postGetCallbacks.forEach((func) => func(true))
        return this
      })
      .catch(() => {
        showErrorNotificationToast('Hiba a betöltés közben')
        this.postGetCallbacks.forEach((func) => func(false))
        return this
      })
  }
}

export function readOnlyEndpointFormDefinition<
  T extends APIUrl,
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
>(url: T, rawFieldSet: FS, queryParams?: QPFS) {
  return new ReadOnlyEndpointFormDefinition(url, rawFieldSet, queryParams)
}
