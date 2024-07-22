import { type Ref, ref } from 'vue'
import { ValidatedModelInterface } from './types'
import { getAxiosInstance } from '../axios'
import { FormDefinition, Form } from '../forms'
import { type FieldSetRaw, type FieldSetData, type FieldSetErrors, FieldSet } from '../fields'

export class SingleEndpointFormDefinition<T extends string, FS extends FieldSetRaw> extends FormDefinition<FS, {}> {
  readonly url: string
  readonly fieldSet: FieldSet<FS>

  constructor(url: T, rawFieldSet: FS) {
    super(rawFieldSet)
    this.url = url
  }

  new(initialData?: Object): SingleEndpointModel<FS> {
    return new SingleEndpointModel<FS>(this, this.fieldSet.toNative(initialData))
  }
}

export class SingleEndpointForm<FS extends FieldSetRaw, FD extends SingleEndpointFormDefinition<any, FS>> extends Form<
  FS,
  FD
> {
  readonly definition: SingleEndpointFormDefinition<string, FS>
  readonly ref: Ref<FieldSetData<FS>>
  readonly errors: Ref<FieldSetErrors<FS>>

  constructor(modelDefinition: SingleEndpointFormDefinition<string, FS>, data: FieldSetData<FS>) {
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

export function singleEndpointFormDefinition<T extends string, FS extends FieldSetRaw>(url: T, rawFieldSet: FS) {
  return new SingleEndpointFormDefinition(url, rawFieldSet)
}
