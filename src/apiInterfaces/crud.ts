import { computed, ComputedRef } from 'vue'
import type { APIUrl, CallbackFunction } from './types'
import { type FieldSetRaw, type FieldSetData, type IdTypeFromFieldSet, FieldBase } from '../fields'
import { getAxiosInstance, showSuccessNotificationToast, showErrorNotificationToast } from '../configurable'
import { BaseWritableApiFormDefinition, BaseWritableApiForm, QueryParams } from './base'
import { createURL, getURLSearchParamsSize } from './utils'
import { DelegatedPromise } from '../promises'

type CrudExtraMethodDefinitions<T extends CrudApiForm<any>> = {
  [key: string]: (this: T, ...args: any[]) => any
}

type CrudExtraMethods<LT extends CrudApiForm<any>, EMD extends CrudExtraMethodDefinitions<LT>> = {
  [key in keyof EMD]: (...args: Parameters<EMD[key]>) => ReturnType<EMD[key]>
}

export class CrudAPIFormDefinition<
  FS extends FieldSetRaw,
  EMD extends CrudExtraMethodDefinitions<CrudApiForm<FS>> = {},
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
> extends BaseWritableApiFormDefinition<FS, QPFS> {
  readonly url: APIUrl
  readonly extraMethods: EMD

  constructor(url: APIUrl, rawFieldSet: FS, extraMethods?: EMD) {
    super(url, rawFieldSet)
    this.url = url

    if (!extraMethods) extraMethods = {} as EMD
    this.extraMethods = extraMethods
  }

  new(initialData?: Partial<FieldSetData<FS>>): CrudApiForm<FS, QPFS> & CrudExtraMethods<CrudApiForm<FS, QPFS>, EMD> {
    if (!initialData) initialData = {}
    return new CrudApiForm<FS, QPFS>(this, this.fieldSet.toNative(initialData)) as CrudApiForm<FS, QPFS> &
      CrudExtraMethods<CrudApiForm<FS, QPFS>, EMD>
  }

  fetch(modelId: IdTypeFromFieldSet<FS>): CrudApiForm<FS> & CrudExtraMethods<CrudApiForm<FS>, EMD> {
    const model = new CrudApiForm<FS>(this, this.fieldSet.toNative({ id: modelId }))
    model.retrieve()
    return model as CrudApiForm<FS> & CrudExtraMethods<CrudApiForm<FS>, EMD>
  }

  fetchOrNew(modelId?: IdTypeFromFieldSet<FS>): CrudApiForm<FS> & CrudExtraMethods<CrudApiForm<FS>, EMD> {
    if (modelId) return this.fetch(modelId)
    return this.new()
  }
}

export class CrudApiForm<
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
> extends BaseWritableApiForm<FS, QPFS> {
  readonly definition: CrudAPIFormDefinition<FS, any, QPFS>
  readonly isSaved: ComputedRef<boolean>

  private readonly postRetrieveCallbacks: CallbackFunction[]
  private readonly postSaveCallbacks: CallbackFunction[]
  private readonly postCreateCallbacks: CallbackFunction[]
  private readonly postUpdateCallbacks: CallbackFunction[]
  private readonly postDeleteCallbacks: CallbackFunction[]

  constructor(formDefinition: CrudAPIFormDefinition<FS, any, QPFS>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.data.value = data

    const temp: Record<string, () => void> = {}
    for (const methodName in this.definition.extraMethods) {
      temp[methodName] = (...args) => {
        return this.definition.extraMethods[methodName].apply(this, args)
      }
    }
    Object.assign(this, temp)

    this.postRetrieveCallbacks = []
    this.postSaveCallbacks = []
    this.postCreateCallbacks = []
    this.postUpdateCallbacks = []
    this.postDeleteCallbacks = []

    this.isSaved = computed(() => {
      return 'id' in this.data.value && !!this.data.value.id
    })
  }

  postRetrieve(func: CallbackFunction) {
    this.postRetrieveCallbacks.push(func)
  }

  postSave(func: CallbackFunction) {
    this.postSaveCallbacks.push(func)
  }

  postCreate(func: CallbackFunction) {
    this.postCreateCallbacks.push(func)
  }

  postUpdate(func: CallbackFunction) {
    this.postUpdateCallbacks.push(func)
  }

  postDelete(func: CallbackFunction) {
    this.postDeleteCallbacks.push(func)
  }

  retrieve(queryParams?: Partial<QueryParams<QPFS>>): Promise<CrudApiForm<FS>> {
    if (!('id' in this.data.value)) {
      console.warn('Cannot retrieve a model without an ID field')
      return new Promise<CrudApiForm<FS>>((resolve) => {
        resolve(this)
      })
    }
    const modelId: IdTypeFromFieldSet<FS> = this.data.value.id as IdTypeFromFieldSet<FS>

    if (queryParams) {
      this.setQueryParams(queryParams)
    }

    const api = getAxiosInstance()
    return api
      .get(this.getApiURL([modelId]))
      .then((response) => {
        this.data.value = this.definition.fieldSet.toNative(response.data)
        this.postRetrieveCallbacks.forEach((func) => func(true))
        return this
      })
      .catch(() => {
        showErrorNotificationToast('Hiba a betöltés közben')
        this.postRetrieveCallbacks.forEach((func) => func(false))
        return this
      })
  }

  create(): Promise<CrudApiForm<FS>> {
    this.validate()
    if (this.hasAnyError()) {
      return new Promise((resolve) => {
        resolve(this)
      })
    }

    const api = getAxiosInstance()
    return api
      .post(this.getApiURL(), this.definition.fieldSet.fromNative(this.data.value))
      .then((response) => {
        showSuccessNotificationToast('Sikeres mentés')
        this.resetErrors()
        this.data.value = this.definition.fieldSet.toNative(response.data)
        this.postSaveCallbacks.forEach((func) => func(true))
        this.postCreateCallbacks.forEach((func) => func(true))
        return this
      })
      .catch((error) => {
        showErrorNotificationToast('Hiba a mentés közben')
        this.apiErrors.value = this.flattenApiErrors(this.definition.fieldSet, error.response.data)
        this.postSaveCallbacks.forEach((func) => func(false))
        this.postCreateCallbacks.forEach((func) => func(false))
        return this
      })
  }

  update(): Promise<CrudApiForm<FS>> {
    this.validate()
    if (this.hasAnyError()) {
      return new Promise((resolve) => {
        resolve(this)
      })
    }

    if (!('id' in this.data.value)) {
      console.warn('Cannot update a model without an ID field')
      return new Promise<CrudApiForm<FS>>((resolve) => {
        resolve(this)
      })
    }
    const modelId: IdTypeFromFieldSet<FS> = this.data.value.id as IdTypeFromFieldSet<FS>

    const api = getAxiosInstance()
    return api
      .put(this.getApiURL([modelId]), this.definition.fieldSet.fromNative(this.data.value))
      .then((response) => {
        showSuccessNotificationToast('Sikeres mentés')
        this.resetErrors()
        this.data.value = this.definition.fieldSet.toNative(response.data)
        this.postSaveCallbacks.forEach((func) => func(true))
        this.postUpdateCallbacks.forEach((func) => func(true))
        return this
      })
      .catch((error) => {
        showErrorNotificationToast('Hiba a mentés közben')
        this.apiErrors.value = this.flattenApiErrors(this.definition.fieldSet, error.response.data)
        this.postSaveCallbacks.forEach((func) => func(false))
        this.postUpdateCallbacks.forEach((func) => func(false))
        return this
      })
  }

  delete(cleanUpPromise?: DelegatedPromise): Promise<CrudApiForm<FS>> {
    if (!('id' in this.data.value)) {
      console.warn('Cannot delete a model without an ID field')
      return new Promise<CrudApiForm<FS>>((resolve) => {
        resolve(this)
      })
    }

    const modelId: IdTypeFromFieldSet<FS> = this.data.value.id as IdTypeFromFieldSet<FS>

    const api = getAxiosInstance()
    return api
      .delete(this.getApiURL([modelId]))
      .then(() => {
        showSuccessNotificationToast('Sikeres törlés')
        this.resetErrors()
        this.postDeleteCallbacks.forEach((func) => func(true))
        return this
      })
      .catch(() => {
        showErrorNotificationToast('Hiba a törlés közben')
        this.postDeleteCallbacks.forEach((func) => func(false))
        return this
      })
      .finally(() => {
        if (cleanUpPromise) {
          cleanUpPromise.resolve()
        }
      })
  }

  save(cleanUpPromise?: DelegatedPromise): Promise<CrudApiForm<FS>> {
    if (!('id' in this.definition.fieldSet.fieldSetRoot)) {
      console.warn('Model cannot be without ID field')
    }

    const isSave = this.data.value.id === null
    let promise: Promise<CrudApiForm<FS>>
    if (isSave) {
      promise = this.create()
    } else {
      promise = this.update()
    }
    return promise.finally(() => {
      if (cleanUpPromise) {
        cleanUpPromise.resolve()
      }
    })
  }

  protected getApiURL(params?: any[]): string {
    if (!params) params = []

    let url =
      typeof this.definition.url === 'function'
        ? this.definition.url(params)
        : createURL(this.definition.url, params[0])
    const queryParams = this.getQueryParamsString()
    if (getURLSearchParamsSize(queryParams) > 0) {
      url += `?${queryParams.toString()}`
    }
    return url
  }
}

export function crudApiFormDefinition<
  T extends APIUrl,
  FS extends FieldSetRaw,
  EMD extends CrudExtraMethodDefinitions<CrudApiForm<FS>> = {},
>(url: T, rawFieldSet: FS, extraMethods?: EMD) {
  return new CrudAPIFormDefinition(url, rawFieldSet, extraMethods)
}
