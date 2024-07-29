import { ComputedRef, type Ref, ref } from 'vue'
import type { APIUrl } from './types'
import { type FieldSetRaw, type FieldSetData, type IdTypeFromFieldSet, type FieldSetErrors } from '../fields'
import { getAxiosInstance } from '../axios'
import { BaseWritableApiFormDefinition, BaseWritableApiForm } from './base'
import { createULR } from './utils'

type CrudExtraMethodDefinitions<T extends CrudApiForm<any>> = {
  [key: string]: (this: T, ...args: any[]) => any
}

type CrudExtraMethods<LT extends CrudApiForm<any>, EMD extends CrudExtraMethodDefinitions<LT>> = {
  [key in keyof EMD]: (...args: Parameters<EMD[key]>) => ReturnType<EMD[key]>
}

export class CrudAPIFormDefinition<
  FS extends FieldSetRaw,
  EMD extends CrudExtraMethodDefinitions<CrudApiForm<FS>> = {},
> extends BaseWritableApiFormDefinition<FS> {
  readonly url: APIUrl
  readonly extraMethods: EMD

  constructor(url: APIUrl, rawFieldSet: FS, extraMethods?: EMD) {
    super(url, rawFieldSet)
    this.url = url

    if (!extraMethods) extraMethods = {} as EMD
    this.extraMethods = extraMethods
  }

  new(initialData?: Partial<FieldSetData<FS>>): CrudApiForm<FS> & CrudExtraMethods<CrudApiForm<FS>, EMD> {
    return new CrudApiForm<FS>(this, this.fieldSet.toNative(initialData)) as CrudApiForm<FS> &
      CrudExtraMethods<CrudApiForm<FS>, EMD>
  }

  fetch(modelId: IdTypeFromFieldSet<FS>): CrudApiForm<FS> & CrudExtraMethods<CrudApiForm<FS>, EMD> {
    const model = new CrudApiForm<FS>(this, this.fieldSet.toNative({ id: modelId }))
    model.retrieve()
    return model as CrudApiForm<FS> & CrudExtraMethods<CrudApiForm<FS>, EMD>
  }

  fetchOrNew(modelId?: IdTypeFromFieldSet<FS>): CrudApiForm<FS> & CrudExtraMethods<CrudApiForm<FS>, EMD> {
    if (!!modelId) return this.fetch(modelId)
    return this.new()
  }
}

export class CrudApiForm<FS extends FieldSetRaw> extends BaseWritableApiForm<FS> {
  readonly definition: CrudAPIFormDefinition<FS, any>
  ref: Ref<FieldSetData<FS>>
  readonly errors: ComputedRef<FieldSetErrors<FS>>

  constructor(formDefinition: CrudAPIFormDefinition<FS, any>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.ref = ref(data) as Ref<FieldSetData<FS>>

    const temp: Record<string, () => void> = {}
    for (const methodName in this.definition.extraMethods) {
      temp[methodName] = (...args) => {
        return this.definition.extraMethods[methodName].apply(this, args)
      }
    }
    Object.assign(this, temp)
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

export function crudApiFormDefinition<
  T extends APIUrl,
  FS extends FieldSetRaw,
  EMD extends CrudExtraMethodDefinitions<CrudApiForm<FS>> = {},
>(url: T, rawFieldSet: FS, extraMethods?: EMD) {
  return new CrudAPIFormDefinition(url, rawFieldSet, extraMethods)
}
