import { type Ref, ref } from 'vue'
import { getAxiosInstance } from '../axios'
import { type FieldSetRaw, type FieldSetData, type FieldSetErrors, FieldSet } from '../fields'
import { ValidatedModelInterface } from './types'

export class SingleEndpointModelDefinition<T extends string, FS extends FieldSetRaw> {
  readonly url: string
  readonly fieldSet: FieldSet<FS>

  constructor(url: T, rawFieldSet: FS) {
    this.url = url
    this.fieldSet = new FieldSet(rawFieldSet)
  }

  new(initialData?: Object): SingleEndpointModel<FS> {
    return new SingleEndpointModel<FS>(this, this.fieldSet.toNative(initialData))
  }
}

export class SingleEndpointModel<FS extends FieldSetRaw> implements ValidatedModelInterface {
  readonly definition: SingleEndpointModelDefinition<string, FS>
  readonly ref: Ref<FieldSetData<FS>>
  readonly errors: Ref<FieldSetErrors<FS>>

  constructor(modelDefinition: SingleEndpointModelDefinition<string, FS>, data: FieldSetData<FS>) {
    this.definition = modelDefinition
    this.ref = ref(data) as Ref<FieldSetData<FS>>
    this.errors = ref({}) as Ref<FieldSetErrors<FS>>
  }

  resetValidation() {
    this.errors.value = {} as FieldSetErrors<FS>
  }

  get() {
    const api = getAxiosInstance()
    return api.get(`${this.definition.url}`).then((response) => {
      this.ref.value = this.definition.fieldSet.toNative(response.data)
      return this
    })
  }

  post() {
    const data = this.definition.fieldSet.fromNative(this.ref.value)

    const api = getAxiosInstance()
    return api
      .post(`${this.definition.url}`, data)
      .then((response) => {
        this.ref.value = this.definition.fieldSet.toNative(response.data)
        return this
      })
      .catch((error) => {
        this.errors.value = error.response.data
        throw error
      })
  }
}

export function singleEndpointModelDefinition<T extends string, FS extends FieldSetRaw>(url: T, rawFieldSet: FS) {
  return new SingleEndpointModelDefinition(url, rawFieldSet)
}
