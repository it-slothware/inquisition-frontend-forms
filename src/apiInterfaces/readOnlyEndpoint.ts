import { type Ref, ref } from 'vue'
import type { APIUrl } from './types'
import { getURLSearchParamsSize } from './utils'
import { getAxiosInstance } from '../axios'
import { type FieldSetRaw, type FieldSetData, FieldSet, FieldBase } from '../fields'

export class ReadOnlyEndpointModelDefinition<T extends APIUrl, FS extends FieldSetRaw> {
  readonly url: T
  readonly fieldSet: FieldSet<FS>

  constructor(url: T, rawFieldSet: FS) {
    this.url = url
    this.fieldSet = new FieldSet(rawFieldSet)
  }

  new(initialData: FieldSetData<FS>): ReadOnlyEndpointModel<FS, ReadOnlyEndpointModelDefinition<T, FS>> {
    return new ReadOnlyEndpointModel<FS, ReadOnlyEndpointModelDefinition<T, FS>>(
      this,
      this.fieldSet.toNative(initialData),
    )
  }
}

export class ReadOnlyEndpointModel<FS extends FieldSetRaw, MD extends ReadOnlyEndpointModelDefinition<APIUrl, FS>> {
  readonly definition: MD
  readonly ref: Ref<FieldSetData<FS>>

  constructor(modelDefinition: MD, data: FieldSetData<FS>) {
    this.definition = modelDefinition
    this.ref = ref<FieldSetData<FS>>(data) as Ref<FieldSetData<FS>>
  }

  get(filterOptions?: Record<string, any>) {
    const params = new URLSearchParams()

    if (filterOptions !== undefined) {
      for (const [key, value] of Object.entries(filterOptions)) {
        params.append(key, value)
      }
    }

    let url: string
    if (typeof this.definition.url === 'string') url = this.definition.url
    else url = this.definition.url()

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

export function readOnlyEndpointModelDefinition<T extends APIUrl, FS extends FieldSetRaw>(url: T, rawFieldSet: FS) {
  return new ReadOnlyEndpointModelDefinition(url, rawFieldSet)
}
