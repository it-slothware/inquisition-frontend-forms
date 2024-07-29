import { ComputedRef, type Ref, ref } from 'vue'
import type { APIUrl } from './types'
import { type FormExtraMethodsDefinition } from '../forms'
import { type FieldSetRaw, type FieldSetData, type IdTypeFromFieldSet, type FieldSetErrors } from '../fields'
import { getAxiosInstance } from '../axios'
import { BaseApiForm, BaseApiFormDefinition } from './base'
import { createULR } from './utils'

export class CrudAPIFormDefinition<
  FS extends FieldSetRaw,
  EMD extends FormExtraMethodsDefinition<any> = {},
> extends BaseApiFormDefinition<FS> {
  readonly url: APIUrl

  constructor(url: APIUrl, rawFieldSet: FS, extraMethods?: EMD) {
    super(url, rawFieldSet)
    this.url = url
  }

  new(initialData?: Partial<FieldSetData<FS>>): CrudApiForm<FS> {
    return new CrudApiForm<FS>(this, this.fieldSet.toNative(initialData))
  }

  fetch(modelId: IdTypeFromFieldSet<FS>): CrudApiForm<FS> {
    const model = new CrudApiForm<FS>(this, this.fieldSet.toNative({ id: modelId }))
    model.retrieve()
    return model
  }

  fetchOrNew(modelId?: IdTypeFromFieldSet<FS>): CrudApiForm<FS> {
    if (!!modelId) return this.fetch(modelId)
    return this.new()
  }
}

export class CrudApiForm<FS extends FieldSetRaw> extends BaseApiForm<FS> {
  readonly definition: CrudAPIFormDefinition<FS, any>
  ref: Ref<FieldSetData<FS>>
  readonly errors: ComputedRef<FieldSetErrors<FS>>

  constructor(formDefinition: CrudAPIFormDefinition<FS, any>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.ref = ref(data) as Ref<FieldSetData<FS>>
  }

  retrieve(): Promise<CrudApiForm<FS>> {
    if (!('id' in this.ref.value)) {
      console.warn('Cannot retrieve a model without an ID field')
      return new Promise<CrudApiForm<FS>>((resolve) => {
        resolve(this)
      })
    }
    const modelId: IdTypeFromFieldSet<FS> = this.ref.value.id as IdTypeFromFieldSet<FS>

    const api = getAxiosInstance()
    return api
      .get(this.getApiURL(modelId))
      .then((response) => {
        this.ref.value = this.definition.fieldSet.toNative(response.data)
        return this
      })
      .catch(() => {
        return this
      })
  }

  create() {
    const api = getAxiosInstance()
    return api
      .post(this.getApiURL(), this.definition.fieldSet.fromNative(this.ref.value))
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
      return new Promise<CrudApiForm<FS>>((resolve) => {
        resolve(this)
      })
    }
    const modelId: IdTypeFromFieldSet<FS> = this.ref.value.id as IdTypeFromFieldSet<FS>

    const api = getAxiosInstance()
    return api
      .put(this.getApiURL(modelId), this.definition.fieldSet.fromNative(this.ref.value))
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
      return new Promise<CrudApiForm<FS>>((resolve) => {
        resolve(this)
      })
    }

    const modelId: IdTypeFromFieldSet<FS> = this.ref.value.id as IdTypeFromFieldSet<FS>

    const api = getAxiosInstance()
    return api
      .delete(this.getApiURL(modelId))
      .then(() => {
        return this
      })
      .catch(() => {
        return this
      })
  }

  protected getApiURL(modelId?: IdTypeFromFieldSet<FS>): string {
    if (typeof this.definition.url === 'function') return this.definition.url({ id: modelId })
    return createULR(this.definition.url, modelId)
  }
}

export function crudApiFormDefinition<T extends APIUrl, FS extends FieldSetRaw>(url: T, rawFieldSet: FS) {
  return new CrudAPIFormDefinition(url, rawFieldSet)
}
