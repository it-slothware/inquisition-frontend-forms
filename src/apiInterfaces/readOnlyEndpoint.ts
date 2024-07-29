import { type Ref, ref } from 'vue'
import type { APIUrl } from './types'
import { getURLSearchParamsSize } from './utils'
import { getAxiosInstance } from '../axios'
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

  constructor(formDefinition: ReadOnlyEndpointFormDefinition<FS>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.ref = ref<FieldSetData<FS>>(data) as Ref<FieldSetData<FS>>
  }

  get(filterOptions?: Record<string, any>) {
    const params = new URLSearchParams()

    if (filterOptions !== undefined) {
      for (const [key, value] of Object.entries(filterOptions)) {
        params.append(key, value)
      }
    }

    let url = this.getApiURL()
    if (getURLSearchParamsSize(params) > 0) {
      url += `?${params.toString()}`
    }

    const api = getAxiosInstance()
    return api.get(url).then((response) => {
      this.ref.value = this.definition.fieldSet.toNative(response.data)
      return this
    })
  }
}

export function readOnlyEndpointFormDefinition<T extends APIUrl, FS extends FieldSetRaw>(url: T, rawFieldSet: FS) {
  return new ReadOnlyEndpointFormDefinition(url, rawFieldSet)
}
