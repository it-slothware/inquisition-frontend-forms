import { type Ref, ref } from 'vue'
import type { ValidatedModelInterface, APIUrl } from './types'
import { type FieldSetRaw, type FieldSetData, type IdTypeFromFieldSet, type FieldSetErrors, FieldSet } from '../fields'
import { getAxiosInstance } from '../axios'

export class CrudModelDefinition<T extends APIUrl, FS extends FieldSetRaw> {
  readonly url: APIUrl
  readonly fieldSet: FieldSet<FS>

  constructor(url: T, rawFieldSet: FS) {
    this.url = url
    this.fieldSet = new FieldSet(rawFieldSet)
  }

  new(initialData: FieldSetData<FS>): CrudModel<FS> {
    return new CrudModel<FS>(this, initialData)
  }

  fetch(modelId: IdTypeFromFieldSet<FS>): CrudModel<FS> {
    const model = new CrudModel<FS>(this, this.fieldSet.toNative({ id: modelId }))
    model.retrieve()
    return model
  }
}

export class CrudModel<FS extends FieldSetRaw> implements ValidatedModelInterface {
  readonly definition: CrudModelDefinition<APIUrl, FS>
  ref: Ref<FieldSetData<FS>>
  readonly errors: Ref<FieldSetErrors<FS>>

  constructor(modelDefinition: CrudModelDefinition<APIUrl, FS>, data: FieldSetData<FS>) {
    this.definition = modelDefinition
    this.ref = ref(data) as Ref<FieldSetData<FS>>
    this.errors = ref(data) as Ref<FieldSetErrors<FS>>
  }

  resetValidation() {
    this.errors.value = {} as FieldSetErrors<FS>
  }

  retrieve() {
    if (!('id' in this.ref.value)) {
      console.warn('Cannot retrieve a model without an ID field')
      return new Promise<CrudModel<FS>>((resolve) => {
        resolve(this)
      })
    }
    const modelId: IdTypeFromFieldSet<FS> = this.ref.value.id as IdTypeFromFieldSet<FS>

    let url: string
    if (typeof this.definition.url === 'string') url = `${this.definition.url}${modelId}/`
    else url = this.definition.url({ id: modelId })

    const api = getAxiosInstance()
    return api
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

    const api = getAxiosInstance()
    return api
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
    const modelId: IdTypeFromFieldSet<FS> = this.ref.value.id as IdTypeFromFieldSet<FS>

    let url: string
    if (typeof this.definition.url === 'string') url = `${this.definition.url}${modelId}/`
    else url = this.definition.url({ id: modelId })

    const api = getAxiosInstance()
    return api
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

    const modelId: IdTypeFromFieldSet<FS> = this.ref.value.id as IdTypeFromFieldSet<FS>

    let url: string
    if (typeof this.definition.url === 'string') url = `${this.definition.url}${modelId}/`
    else url = this.definition.url({ id: modelId })

    const api = getAxiosInstance()
    return api
      .delete(url)
      .then(() => {
        return this
      })
      .catch(() => {
        return this
      })
  }
}

export function crudModelDefinition<T extends APIUrl, FS extends FieldSetRaw>(url: T, rawFieldSet: FS) {
  return new CrudModelDefinition(url, rawFieldSet)
}
