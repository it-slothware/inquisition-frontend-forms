import { type Ref, ref } from 'vue'
import { $api } from '@/plugins/axiosPlugin'
import { type ModelFieldSetRaw, type ModelData, type ModelErrors, ModelFieldSet } from './fields'
import type { ValidatedModelInterface } from './types'

export class SingleEndpointModelDefinition<T extends string, FS extends ModelFieldSetRaw> {
  readonly url: string
  readonly fieldSet: ModelFieldSet<FS>

  constructor(url: T, rawFieldSet: FS) {
    this.url = url
    this.fieldSet = new ModelFieldSet(rawFieldSet)
  }

  new(initialData?: Object): SingleEndpointModel<FS> {
    return new SingleEndpointModel<FS>(this, this.fieldSet.toNative(initialData))
  }
}

export class SingleEndpointModel<FS extends ModelFieldSetRaw> implements ValidatedModelInterface {
  readonly definition: SingleEndpointModelDefinition<string, FS>
  readonly ref: Ref<ModelData<FS>>
  readonly errors: Ref<ModelErrors<FS>>

  constructor(modelDefinition: SingleEndpointModelDefinition<string, FS>, data: ModelData<FS>) {
    this.definition = modelDefinition
    this.ref = ref(data) as Ref<ModelData<FS>>
    this.errors = ref({}) as Ref<ModelData<FS>>
  }

  resetValidation() {
    this.errors.value = {} as ModelErrors<FS>
  }

  get() {
    return $api.get(`${this.definition.url}`).then(response => {
      this.ref.value = this.definition.fieldSet.toNative(response.data)
      return this
    })
  }

  post() {
    const data = this.definition.fieldSet.fromNative(this.ref.value)
    return $api
      .post(`${this.definition.url}`, data)
      .then(response => {
        this.ref.value = this.definition.fieldSet.toNative(response.data)
        return this
      })
      .catch(error => {
        this.errors.value = error.response.data
        throw error
      })
  }
}
