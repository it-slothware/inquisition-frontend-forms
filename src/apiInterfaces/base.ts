import { computed, ComputedRef, type Ref, ref } from 'vue'
import type { APIUrl } from './types'
import { FormDefinition, Form } from '../forms'
import {
  type FieldSetRaw,
  type FieldSetData,
  type FlattenedErrors,
  FieldSet,
  ArrayField,
  extendErrors,
  ErrorList,
  FieldSetErrors,
  FieldBase,
} from '../fields'
import { getURLSearchParamsSize } from '@/inquisition-forms'
import { isStringArray } from '@/inquisition-forms/utils'

export type QueryParams<T extends FieldSetRaw> = {
  [key in keyof T]: QueryParamsValueType<T, key>
}
type QueryParamsValueType<T extends FieldSetRaw, K extends keyof T> = T[K] extends FieldBase<any>
  ? ReturnType<T[K]['toNative']> | null
  : never

export class BaseApiFormDefinition<
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
> extends FormDefinition<FS> {
  readonly url: APIUrl
  readonly queryParamsFieldSet: FieldSet<QPFS>

  constructor(url: APIUrl, rawFieldSet: FS, queryParamsFieldSet?: QPFS) {
    super(rawFieldSet)
    this.url = url

    if (!queryParamsFieldSet) queryParamsFieldSet = {} as QPFS
    this.queryParamsFieldSet = new FieldSet<QPFS>(queryParamsFieldSet)
  }

  new(initialData?: Partial<FieldSetData<FS>>): BaseApiForm<FS, QPFS> {
    return new BaseApiForm<FS, QPFS>(this, this.fieldSet.toNative(initialData))
  }
}

export class BaseApiForm<FS extends FieldSetRaw, QPFS extends FieldSetRaw> extends Form<FS> {
  readonly definition: BaseApiFormDefinition<FS>
  readonly data: Ref<FieldSetData<FS>>
  readonly errors: ComputedRef<FieldSetErrors<FS>>
  readonly queryParams: Ref<QueryParams<QPFS>>

  constructor(formDefinition: BaseApiFormDefinition<FS>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.data = ref<FieldSetData<FS>>(this.definition.fieldSet.getDefault()) as Ref<FieldSetData<FS>>
    this.errors = computed(() => this.hydrateErrors())
    this.queryParams = ref(formDefinition.queryParamsFieldSet.getDefault()) as Ref<QueryParams<QPFS>>
  }

  setQueryParams(filterOptions: Partial<QueryParams<QPFS>>): void {
    Object.assign(this.queryParams.value, filterOptions)
  }

  setQueryParam<K extends keyof QueryParams<QPFS>>(optionKey: K, value: QueryParamsValueType<QPFS, K>): void {
    this.queryParams.value[optionKey] = value
  }

  protected getQueryParamsString(): URLSearchParams {
    const queryParams = new URLSearchParams()
    for (const [fieldName, field] of Object.entries(this.definition.queryParamsFieldSet.fieldSetRoot)) {
      const value = this.queryParams.value[fieldName]
      if (value === undefined || value === null || value === '') continue
      queryParams.append(fieldName, field.fromNative(value))
    }
    return queryParams
  }

  protected getApiURL(...args: any[]): string {
    let url = this.definition.url instanceof Function ? this.definition.url(...args) : this.definition.url
    const queryParams = this.getQueryParamsString()
    if (getURLSearchParamsSize(queryParams) > 0) {
      url += `?${queryParams.toString()}`
    }
    return url
  }
}

export class BaseWritableApiFormDefinition<
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
> extends BaseApiFormDefinition<FS, QPFS> {}

export class BaseWritableApiForm<
  FS extends FieldSetRaw,
  QPFS extends FieldSetRaw = Record<string, FieldBase<any>>,
> extends BaseApiForm<FS, QPFS> {
  readonly definition: BaseWritableApiFormDefinition<FS>
  readonly apiErrors: Ref<FlattenedErrors>

  constructor(formDefinition: BaseApiFormDefinition<FS>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
    this.apiErrors = ref({})
  }

  protected getFlatError(accessor: string): ErrorList {
    const validationErrors = super.getFlatError(accessor)
    const apiErrors = this.apiErrors.value[accessor] || []
    return [...validationErrors, ...apiErrors]
  }

  protected hasAnyError(): boolean {
    return (
      Object.values(this.validationErrors.value).filter((e) => e.length > 0).length > 0 ||
      Object.values(this.apiErrors.value).filter((e) => e.length > 0).length > 0
    )
  }

  hasFieldErrors(fieldNames: string | string[]): boolean {
    if (!Array.isArray(fieldNames)) {
      fieldNames = [fieldNames]
    }

    return fieldNames
      .map((fn) => {
        if (fn.endsWith('*')) {
          fn = fn.slice(0, -1)

          const hasValidationErrors = super.hasFieldErrors(fieldNames)

          return (
            hasValidationErrors ||
            Object.keys(this.apiErrors.value)
              .filter((k) => k.startsWith(fn))
              .map((k) => this.getFlatError(k).length > 0)
              .reduce((a, b) => a || b, false)
          )
        }
        return this.getFlatError(fn).length > 0
      })
      .reduce((a, b) => a || b, false)
  }

  resetErrors() {
    super.resetErrors()
    this.apiErrors.value = {}
  }

  protected flattenApiErrors(fieldSet: FieldSet<any, any>, apiErrors: any): FlattenedErrors {
    const errors: Record<string, any> = {}

    if ('non_field_errors' in apiErrors) {
      errors['non_field_errors'] = apiErrors.non_field_errors
    }

    for (const [fieldName, field] of Object.entries(fieldSet.fieldSetRoot)) {
      if (!(fieldName in apiErrors)) continue

      if (field instanceof FieldSet) {
        extendErrors(errors, this.flattenApiErrors(field, apiErrors[fieldName]), fieldName)
      } else if (field instanceof ArrayField) {
        apiErrors[fieldName]
        if (isStringArray(apiErrors[fieldName])) {
          errors[`${fieldName}.non_field_errors`] = apiErrors[fieldName]
          continue
        }

        const baseField = field.baseField
        if (baseField instanceof FieldSet) {
          apiErrors[fieldName].forEach((e: any, i: number) =>
            extendErrors(errors, this.flattenApiErrors(baseField, e), `${fieldName}.${i}`),
          )
        } else {
          apiErrors[fieldName].forEach((e: any, i: number) => {
            errors[`${fieldName}.${i}`] = e
          })
        }
      } else {
        errors[fieldName] = apiErrors[fieldName]
      }
    }

    return errors as FlattenedErrors
  }
}
