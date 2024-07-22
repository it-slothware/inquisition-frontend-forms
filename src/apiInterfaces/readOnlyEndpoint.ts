import { type Ref, ref } from 'vue'
import type { APIUrl } from './types'
import { getURLSearchParamsSize } from './utils'
import { getAxiosInstance } from '../axios'
import { FormDefinition, Form } from '../forms'
import { type FieldSetRaw, type FieldSetData } from '../fields'

export class ReadOnlyEndpointFormDefinition<T extends APIUrl, FS extends FieldSetRaw> extends FormDefinition<FS> {
  readonly url: T

  constructor(url: T, rawFieldSet: FS) {
    super(rawFieldSet)
    this.url = url
  }

  new(initialData?: Partial<FieldSetData<FS>>): ReadOnlyEndpointForm<FS, any> {
    return new ReadOnlyEndpointForm<FS, ReadOnlyEndpointFormDefinition<T, FS>>(
      this,
      this.fieldSet.toNative(initialData),
    )
  }
}

export class ReadOnlyEndpointForm<
  FS extends FieldSetRaw,
  FD extends ReadOnlyEndpointFormDefinition<APIUrl, FS>,
> extends Form<FS, FD> {
  readonly definition: FD
  readonly ref: Ref<FieldSetData<FS>>

  constructor(formDefinition: FD, data: FieldSetData<FS>) {
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

export function readOnlyEndpointFormDefinition<T extends APIUrl, FS extends FieldSetRaw>(url: T, rawFieldSet: FS) {
  return new ReadOnlyEndpointFormDefinition(url, rawFieldSet)
}
