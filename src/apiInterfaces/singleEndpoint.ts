import type { APIUrl, CallbackFunction, RecursivePartial, APIResponseNotifications } from './types'
import { getAxiosInstance, showSuccessNotificationToast, showErrorNotificationToast } from '../configurable'
import { type FieldSetRaw, type FieldSetData, FieldBase } from '../fields'
import { BaseWritableApiFormDefinition, BaseWritableApiForm, QueryParams } from './base'

interface SingleEndpointFormConfiguration {
  getNotifications: APIResponseNotifications
  postNotifications: APIResponseNotifications
}

const singleEndpointFormDefaultConfiguration: SingleEndpointFormConfiguration = {
  getNotifications: {
    success: '',
    failure: 'Hiba a betöltés közben',
  },
  postNotifications: {
    success: 'Sikeres mentés',
    failure: 'Hiba a mentés közben',
  },
}

export class SingleEndpointFormDefinition<
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
> extends BaseWritableApiFormDefinition<FS, QPFS> {
  readonly url: APIUrl
  readonly config: SingleEndpointFormConfiguration

  constructor(
    url: APIUrl,
    rawFieldSet: FS,
    queryParams?: QPFS,
    config?: RecursivePartial<SingleEndpointFormConfiguration>,
  ) {
    super(url, rawFieldSet, queryParams)
    this.url = url
    this.config = Object.assign(JSON.parse(JSON.stringify(singleEndpointFormDefaultConfiguration)), config)
  }

  new(initialData?: Partial<FieldSetData<FS>>): SingleEndpointForm<FS, QPFS> {
    if (!initialData) initialData = {}
    return new SingleEndpointForm<FS, QPFS>(this, this.fieldSet.toNative(initialData))
  }

  fetch(queryParams?: Record<string, any>): SingleEndpointForm<FS> {
    const model = new SingleEndpointForm<FS>(this, this.fieldSet.toNative({}))
    model.get(queryParams)
    return model
  }
}

export class SingleEndpointForm<
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
> extends BaseWritableApiForm<FS, QPFS> {
  readonly definition: SingleEndpointFormDefinition<FS>

  private readonly postGetCallbacks: CallbackFunction[]
  private readonly postPostCallbacks: CallbackFunction[]

  constructor(formDefinition: SingleEndpointFormDefinition<FS, QPFS>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.data.value = this.definition.fieldSet.toNative(data)

    this.postGetCallbacks = []
    this.postPostCallbacks = []
  }

  postGet(func: CallbackFunction) {
    this.postGetCallbacks.push(func)
  }

  postPost(func: CallbackFunction) {
    this.postPostCallbacks.push(func)
  }

  get(queryParams?: Partial<QueryParams<QPFS>>, urlParams?: any[]): Promise<SingleEndpointForm<FS>> {
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
        showErrorNotificationToast(this.definition.config.getNotifications.failure)
        this.postGetCallbacks.forEach((func) => func(false))
        return this
      })
  }

  post(urlParams?: any[]): Promise<SingleEndpointForm<FS>> {
    const data = this.definition.fieldSet.fromNative(this.data.value)
    this.resetErrors()

    const api = getAxiosInstance()
    return api
      .post(this.getApiURL(urlParams), data)
      .then((response) => {
        if (response.data && response.data !== '') {
          this.data.value = this.definition.fieldSet.toNative(response.data)
        }
        showSuccessNotificationToast(this.definition.config.postNotifications.success)
        this.postPostCallbacks.forEach((func) => func(true))
        return this
      })
      .catch((error) => {
        this.apiErrors.value = this.flattenApiErrors(this.definition.fieldSet, error.response.data)
        showErrorNotificationToast(this.definition.config.postNotifications.failure)
        this.postPostCallbacks.forEach((func) => func(false))
        return this
      })
  }
}

export function singleEndpointFormDefinition<
  T extends APIUrl,
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
>(url: T, rawFieldSet: FS, queryParams?: QPFS, config?: RecursivePartial<SingleEndpointFormConfiguration>) {
  return new SingleEndpointFormDefinition(url, rawFieldSet, queryParams, config)
}
