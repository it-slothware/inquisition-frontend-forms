import { type Ref, ref } from 'vue'
import { type APIUrl } from './types'
import { getAxiosInstance } from '../axios'
import { type FieldSetRaw, type FieldSetData, FieldSet } from '../fields'
import { BaseWritableApiFormDefinition, BaseWritableApiForm } from './base'

export class SingleEndpointFormDefinition<FS extends FieldSetRaw> extends BaseWritableApiFormDefinition<FS> {
  readonly url: APIUrl
  readonly fieldSet: FieldSet<FS>

  constructor(url: APIUrl, rawFieldSet: FS) {
    super(url, rawFieldSet)
    this.url = url
  }

  new(initialData?: Partial<FieldSetData<FS>>): SingleEndpointForm<FS> {
    return new SingleEndpointForm<FS>(this, this.fieldSet.toNative(initialData))
  }
}

export class SingleEndpointForm<FS extends FieldSetRaw> extends BaseWritableApiForm<FS> {
  readonly definition: SingleEndpointFormDefinition<FS>
  readonly ref: Ref<FieldSetData<FS>>

  constructor(formDefinition: SingleEndpointFormDefinition<FS>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.ref = ref(data) as Ref<FieldSetData<FS>>
  }

  get(): Promise<SingleEndpointForm<FS>> {
    const api = getAxiosInstance()
    return api.get(`${this.definition.url}`).then((response) => {
      this.ref.value = this.definition.fieldSet.toNative(response.data)
      return this
    })
  }

  post(): Promise<SingleEndpointForm<FS>> {
    const data = this.definition.fieldSet.fromNative(this.ref.value)

    const api = getAxiosInstance()
    return api
      .post(`${this.definition.url}`, data)
      .then((response) => {
        this.ref.value = this.definition.fieldSet.toNative(response.data)
        return this
      })
      .catch((error) => {
        this.apiErrors.value = this.flattenApiErrors(this.definition.fieldSet, error.response.data)
        return this
      })
  }
}

export function singleEndpointFormDefinition<T extends string, FS extends FieldSetRaw>(url: T, rawFieldSet: FS) {
  return new SingleEndpointFormDefinition(url, rawFieldSet)
}
