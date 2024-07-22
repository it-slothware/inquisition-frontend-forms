import { ComputedRef, type Ref, ref } from 'vue'
import type { ValidatedModelInterface, APIUrl } from './types'
import { type FormExtraMethodsDefinition, FormDefinition, Form, FormWithExtraMethods } from '../forms'
import { type FieldSetRaw, type FieldSetData, type IdTypeFromFieldSet, type FieldSetErrors, FieldSet } from '../fields'
import { getAxiosInstance } from '../axios'

export class CrudAPIFormDefinition<
  T extends APIUrl,
  FS extends FieldSetRaw,
  EMD extends FormExtraMethodsDefinition<any> = {},
> extends FormDefinition<FS, EMD> {
  readonly url: APIUrl

  constructor(url: T, rawFieldSet: FS, extraMethods?: EMD) {
    super(rawFieldSet, extraMethods)
    this.url = url
  }

  fetch(modelId: IdTypeFromFieldSet<FS>): CrudForm<FS> {
    const model = new CrudForm<FS>(this, this.fieldSet.toNative({ id: modelId }))
    model.retrieve()
    return model
  }

  fetchOrNew(modelId?: IdTypeFromFieldSet<FS>): CrudForm<FS> {
    if (!!modelId) return this.fetch(modelId)
    return this.new()
  }
}

export class CrudForm<FS extends FieldSetRaw> extends Form<FS> {
  readonly definition: CrudAPIFormDefinition<APIUrl, FS, any>
  ref: Ref<FieldSetData<FS>>
  readonly errors: ComputedRef<FieldSetErrors<FS>>

  constructor(modelDefinition: CrudAPIFormDefinition<APIUrl, FS, any>, data: FieldSetData<FS>) {
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
      return new Promise<CrudForm<FS>>((resolve) => {
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
