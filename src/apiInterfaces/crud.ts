import { type Ref, ref } from 'vue'
import { $api } from '@/plugins/axiosPlugin'
import {
  type ModelFieldSetRaw,
  type ModelData,
  type ModelErrors,
  type IdTypeFromModelFieldSet,
  ModelFieldSet,
} from './fields'
import type { ValidatedModelInterface, APIUrl } from './types'

export class CrudModelDefinition<T extends APIUrl, FS extends ModelFieldSetRaw> {
  readonly url: APIUrl
  readonly fieldSet: ModelFieldSet<FS>

  constructor(url: T, rawFieldSet: FS) {
    this.url = url
    this.fieldSet = new ModelFieldSet(rawFieldSet)
  }

  new(initialData: ModelData<FS>): CrudModel<FS> {
    return new CrudModel<FS>(this, initialData)
  }

  fetch(modelId: IdTypeFromModelFieldSet<FS>): CrudModel<FS> {
    const model = new CrudModel<FS>(this, this.fieldSet.toNative({ id: modelId }))
    model.retrieve()
    return model
  }
}

export class CrudModel<FS extends ModelFieldSetRaw> implements ValidatedModelInterface {
  readonly definition: CrudModelDefinition<APIUrl, FS>
  ref: Ref<ModelData<FS>>
  readonly errors: Ref<ModelErrors<FS>>

  constructor(modelDefinition: CrudModelDefinition<APIUrl, FS>, data: ModelData<FS>) {
    this.definition = modelDefinition
    this.ref = ref(data) as Ref<ModelData<FS>>
    this.errors = ref(data) as Ref<ModelErrors<FS>>
  }

  resetValidation() {
    this.errors.value = {} as ModelErrors<FS>
  }

  retrieve() {
    if (!('id' in this.ref.value)) {
      console.warn('Cannot retrieve a model without an ID field')
      return new Promise<CrudModel<FS>>((resolve) => {
        resolve(this)
      })
    }
    const modelId: IdTypeFromModelFieldSet<FS> = this.ref.value.id as IdTypeFromModelFieldSet<FS>

    let url: string
    if (typeof this.definition.url === 'string') url = `${this.definition.url}${modelId}/`
    else url = this.definition.url({ id: modelId })

    return $api
      .get(url)
      .then((response) => {
        this.ref.value = this.definition.fieldSet.toNative(response.data)
        return this
      })
      .catch(() => {
        return this
      })
  }

  create() {
    let url: string
    if (typeof this.definition.url === 'string') url = this.definition.url
    else url = this.definition.url()
    return $api
      .post(url, this.definition.fieldSet.fromNative(this.ref.value))
      .then((response) => {
        this.ref.value = this.definition.fieldSet.toNative(response.data)
        return this
      })
      .catch(() => {
        return this
      })
  }

  update() {
    if (!('id' in this.ref.value)) {
      console.warn('Cannot update a model without an ID field')
      return new Promise<CrudModel<FS>>((resolve) => {
        resolve(this)
      })
    }
    const modelId: IdTypeFromModelFieldSet<FS> = this.ref.value.id as IdTypeFromModelFieldSet<FS>

    let url: string
    if (typeof this.definition.url === 'string') url = `${this.definition.url}${modelId}/`
    else url = this.definition.url({ id: modelId })
    return $api
      .put(url, this.definition.fieldSet.fromNative(this.ref.value))
      .then((response) => {
        this.ref.value = this.definition.fieldSet.toNative(response.data)
        return this
      })
      .catch(() => {
        return this
      })
  }

  delete() {
    if (!('id' in this.ref.value)) {
      console.warn('Cannot delete a model without an ID field')
      return new Promise<CrudModel<FS>>((resolve) => {
        resolve(this)
      })
    }

    const modelId: IdTypeFromModelFieldSet<FS> = this.ref.value.id as IdTypeFromModelFieldSet<FS>

    let url: string
    if (typeof this.definition.url === 'string') url = `${this.definition.url}${modelId}/`
    else url = this.definition.url({ id: modelId })
    return $api
      .delete(url)
      .then(() => {
        return this
      })
      .catch(() => {
        return this
      })
  }
}
