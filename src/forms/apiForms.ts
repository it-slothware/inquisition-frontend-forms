import axios from 'axios'
import { type Ref, ref, type ComputedRef, computed } from 'vue'
import { type ErrorList, type FormData, type FormFieldSetRaw, type IdTypeFromFormFieldSet } from './fields'
import {
  type FormExtraMethodsDefinition,
  type FormWithExtraMethods,
  type FlattenedErrors,
  type CallbackFunction,
  FormDefinition,
  Form,
} from './form'
import { $api } from '@/plugins/axiosPlugin'
import { makeURL } from '@/logics/utils'
import { showSuccessNotification, showErrorNotification } from '@/composables/notifications'

//---------------------
//        Bases
//---------------------
export class APIFormDefinitionsBase<
  T extends string,
  FS extends FormFieldSetRaw,
  EMD extends FormExtraMethodsDefinition<APIFormsBase<FS>>,
> extends FormDefinition<FS, any> {
  readonly url: string
  declare readonly extraMethods: EMD

  constructor(url: T, rawFieldSet: FS, extraMethods?: EMD) {
    super(rawFieldSet, extraMethods)
    this.url = url
  }
}

export class APIFormsBase<FS extends FormFieldSetRaw> extends Form<FS> {
  readonly definition: APIFormDefinitionsBase<string, FS, any>
  protected readonly apiErrors: Ref<FlattenedErrors>

  constructor(formDefinition: APIFormDefinitionsBase<string, FS, any>, data: FormData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.apiErrors = ref({})

    const mappedMethods: Record<string, () => void> = {}
    for (const methodName in this.definition.extraMethods) {
      mappedMethods[methodName] = (...args) => {
        this.definition.extraMethods[methodName].apply(this, args)
      }
    }
    Object.assign(this, mappedMethods)
  }

  protected getFlatError(accessor: string): ErrorList {
    const existingErrors = super.getFlatError(accessor)
    const apiErrors = this.apiErrors.value[accessor] || []
    return [...existingErrors, ...apiErrors]
  }

  resetErrors() {
    super.resetErrors()
    this.apiErrors.value = {}
  }

  protected hasAnyError(): boolean {
    const hasExistingErrors = super.hasAnyError()
    const hasApiErrors = Object.values(this.apiErrors.value).filter((e) => e.length > 0).length > 0
    return hasExistingErrors || hasApiErrors
  }

  protected flattenApiErrors(apiErrors: Record<string, any>): FlattenedErrors {
    return this.flattenAPIErrorDict(apiErrors, [])
  }

  protected flattenAPIErrorDict(apiErrors: Record<string, any>, accessors: string[]): FlattenedErrors {
    const flattenedErrors: FlattenedErrors = {}
    for (const [key, errors] of Object.entries(apiErrors)) {
      if (isStringArray(errors)) flattenedErrors[[...accessors, key].join('.')] = errors
      else if (Array.isArray(errors)) {
        errors.forEach((e, index) => {
          if (isStringArray(e)) flattenedErrors[[...accessors, key, index.toString()].join('.')] = e
          else Object.assign(flattenedErrors, this.flattenAPIErrorDict(e, [...accessors, key, index.toString()]))
        })
      } else {
        Object.assign(flattenedErrors, this.flattenAPIErrorDict(errors, [...accessors, key]))
      }
    }
    return flattenedErrors
  }
}

// ------------------------
//         API Form
// ------------------------
export class APIFormDefinition<
  T extends string,
  FS extends FormFieldSetRaw,
  EMD extends FormExtraMethodsDefinition<APIForm<FS>>,
> extends APIFormDefinitionsBase<T, FS, any> {
  declare readonly extraMethods: EMD

  constructor(url: T, rawFieldSet: FS, extraMethods?: EMD) {
    super(url, rawFieldSet, extraMethods)
  }

  new(): FormWithExtraMethods<APIForm<FS>, EMD> {
    return new APIForm<FS>(this, this.fieldSet.getDefault()) as FormWithExtraMethods<APIForm<FS>, EMD>
  }

  fetch(): FormWithExtraMethods<APIForm<FS>, EMD> {
    const form = new APIForm<FS>(this, this.fieldSet.getDefault()) as FormWithExtraMethods<APIForm<FS>, EMD>
    form.load()
    return form
  }
}

export class APIForm<FS extends FormFieldSetRaw> extends APIFormsBase<FS> {
  readonly definition: APIFormDefinition<string, FS, any>
  protected readonly apiErrors: Ref<FlattenedErrors>

  readonly #postFetchCallbacks: CallbackFunction[]
  readonly #postSaveCallbacks: CallbackFunction[]

  constructor(formDefinition: APIFormDefinition<string, FS, any>, data: FormData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.apiErrors = ref({})

    this.#postFetchCallbacks = []
    this.#postSaveCallbacks = []
  }

  postFetch(fn: CallbackFunction) {
    this.#postFetchCallbacks.push(fn)
  }

  postSave(fn: CallbackFunction) {
    this.#postSaveCallbacks.push(fn)
  }

  load() {
    return $api
      .get(this.definition.url)
      .then((response) => {
        this.data.value = response.data
        showSuccessNotification('Sikeres mentés')
        this.#postFetchCallbacks.forEach((fn) => fn(true))
        return response
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status) {
            this.apiErrors.value = this.flattenApiErrors(error.response.data as Record<string, string>)
          }
        }
        showErrorNotification('Hiba a mentés közben')
        this.#postSaveCallbacks.forEach((fn) => fn(false))
      })
  }

  save(): Promise<void> {
    this.validate()
    if (this.hasErrors.value) {
      return new Promise((resolve, reject) => {
        this.#postSaveCallbacks.forEach((fn) => fn(false))
        reject()
      })
    }

    return $api
      .post(this.definition.url, this.data.value)
      .then((response) => {
        this.data.value = response.data
        this.#postSaveCallbacks.forEach((fn) => fn(true))
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 400) {
            this.apiErrors.value = this.flattenApiErrors(error.response.data as Record<string, any>)
          }
        }
        this.#postSaveCallbacks.forEach((fn) => fn(false))
      })
  }
}

// -------------------------
//         CRUD Form
// -------------------------
export class CRUDFormDefinition<
  T extends string,
  FS extends FormFieldSetRaw,
  EMD extends FormExtraMethodsDefinition<CRUDForm<FS>>,
> extends APIFormDefinitionsBase<T, FS, any> {
  readonly url: string
  declare readonly extraMethods: EMD

  constructor(url: T, rawFieldSet: FS, extraMethods?: EMD) {
    super(url, rawFieldSet, extraMethods)
    this.url = url
  }

  new(): FormWithExtraMethods<CRUDForm<FS>, EMD> {
    return new CRUDForm<FS>(this, this.fieldSet.getDefault()) as FormWithExtraMethods<CRUDForm<FS>, EMD>
  }

  fetch(modelId: IdTypeFromFormFieldSet<FS>): FormWithExtraMethods<CRUDForm<FS>, EMD> {
    const form = new CRUDForm<FS>(this, this.fieldSet.getDefault()) as FormWithExtraMethods<CRUDForm<FS>, EMD>
    form.load(modelId)
    return form
  }

  fetchOrNew(modelId?: IdTypeFromFormFieldSet<FS> | null): FormWithExtraMethods<CRUDForm<FS>, EMD> {
    if (modelId === null || modelId === undefined) return this.new()
    return this.fetch(modelId)
  }
}

export class CRUDForm<FS extends FormFieldSetRaw> extends APIFormsBase<FS> {
  readonly definition: CRUDFormDefinition<string, FS, any>
  readonly isSaved: ComputedRef<boolean>

  readonly #postCreateCallbacks: CallbackFunction[]
  readonly #postUpdateCallbacks: CallbackFunction[]
  readonly #postDeleteCallbacks: CallbackFunction[]

  constructor(formDefinition: CRUDFormDefinition<string, FS, any>, data: FormData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition

    this.#postCreateCallbacks = []
    this.#postUpdateCallbacks = []
    this.#postDeleteCallbacks = []

    this.isSaved = computed(() => {
      return this.data.value.id !== null
    })
  }

  postCreate(fn: CallbackFunction) {
    this.#postCreateCallbacks.push(fn)
  }

  postUpdate(fn: CallbackFunction) {
    this.#postUpdateCallbacks.push(fn)
  }

  postDelete(fn: CallbackFunction) {
    this.#postDeleteCallbacks.push(fn)
  }

  load(modelId: IdTypeFromFormFieldSet<FS>) {
    return $api.get(makeURL(this.definition.url, modelId)).then((response) => {
      this.data.value = response.data
      return response
    })
  }

  save(): Promise<void> {
    if (!('id' in this.definition.fieldSet.fieldSetRoot)) {
      console.warn('Model cannot be without ID field')
    }

    const isSave = this.data.value.id === null

    this.validate()
    if (this.hasErrors.value)
      return new Promise((resolve, reject) => {
        if (isSave) this.#postCreateCallbacks.forEach((fn) => fn(false))
        else this.#postUpdateCallbacks.forEach((fn) => fn(false))
        reject()
      })

    let url: string
    let method: 'post' | 'put'
    let callbackList: CallbackFunction[]
    if (isSave) {
      url = makeURL(this.definition.url)
      method = 'post'
      callbackList = this.#postCreateCallbacks
    } else {
      url = makeURL(this.definition.url, this.data.value.id)
      method = 'put'
      callbackList = this.#postUpdateCallbacks
    }

    return $api[method](url, this.data.value)
      .then((response) => {
        this.data.value = response.data
        showSuccessNotification('Sikeres mentés')
        callbackList.forEach((fn) => fn(true))
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 400) {
            this.apiErrors.value = this.flattenApiErrors(error.response.data as Record<string, any>)
          }
        }
        showErrorNotification('Hiba a mentés közben')
        callbackList.forEach((fn) => fn(false))
      })
  }

  delete(): Promise<void> {
    return $api
      .delete(makeURL(this.definition.url, this.data.value.id))
      .then(() => {
        this.reset()
        showSuccessNotification('Sikeres törlés')
        this.#postDeleteCallbacks.forEach((fn) => fn(true))
      })
      .catch(() => {
        showErrorNotification('Hiba a törlés közben')
        this.#postDeleteCallbacks.forEach((fn) => fn(false))
      })
  }
}

function isStringArray(something: any): something is string[] {
  if (!Array.isArray(something)) return false
  return something.map((x) => typeof x === 'string').reduce((a, b) => a && b)
}
