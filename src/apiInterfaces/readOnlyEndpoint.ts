import { type Ref, ref } from 'vue'
import type { APIUrl, CallbackFunction } from './types'
import { getURLSearchParamsSize } from './utils'
import { getAxiosInstance, showErrorNotification } from '../configurable'
import { type FieldSetRaw, type FieldSetData } from '../fields'
import { BaseApiForm, BaseApiFormDefinition } from './base'

export class ReadOnlyEndpointFormDefinition<FS extends FieldSetRaw> extends BaseApiFormDefinition<FS> {
  readonly url: APIUrl

  constructor(url: APIUrl, rawFieldSet: FS) {
    super(url, rawFieldSet)
    this.url = url
  }

  new(initialData?: Partial<FieldSetData<FS>>): ReadOnlyEndpointForm<FS> {
    return new ReadOnlyEndpointForm<FS>(this, this.fieldSet.toNative(initialData))
  }
}

export class ReadOnlyEndpointForm<FS extends FieldSetRaw> extends BaseApiForm<FS> {
  readonly definition: ReadOnlyEndpointFormDefinition<FS>
  readonly ref: Ref<FieldSetData<FS>>

  private readonly postGetCallbacks: CallbackFunction[]

  constructor(formDefinition: ReadOnlyEndpointFormDefinition<FS>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.ref = ref<FieldSetData<FS>>(data) as Ref<FieldSetData<FS>>

    this.postGetCallbacks = []
  }

  postGet(func: CallbackFunction) {
    this.postGetCallbacks.push(func)
  }

  get(queryParams?: Record<string, any>) {
    const params = new URLSearchParams()

    if (queryParams !== undefined) {
      for (const [key, value] of Object.entries(queryParams)) {
        params.append(key, value)
      }
    }

    let url = this.getApiURL()
    if (getURLSearchParamsSize(params) > 0) {
      url += `?${params.toString()}`
    }

    const api = getAxiosInstance()
    return api
      .get(url)
      .then((response) => {
        this.ref.value = this.definition.fieldSet.toNative(response.data)
        this.postGetCallbacks.forEach((func) => func(true))
        return this
      })
      .catch(() => {
        showErrorNotification('Hiba a betöltés közben')
        this.postGetCallbacks.forEach((func) => func(false))
        return this
      })
  }
}

export function readOnlyEndpointFormDefinition<T extends APIUrl, FS extends FieldSetRaw>(url: T, rawFieldSet: FS) {
  return new ReadOnlyEndpointFormDefinition(url, rawFieldSet)
}
