import { type Ref, ref } from 'vue'
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
} from '../fields'

export class BaseApiFormDefinition<FS extends FieldSetRaw> extends FormDefinition<FS> {
  readonly url: APIUrl

  constructor(url: APIUrl, rawFieldSet: FS) {
    super(rawFieldSet)
    this.url = url
  }

  new(initialData?: Partial<FieldSetData<FS>>): BaseApiForm<FS> {
    return new BaseApiForm<FS>(this, this.fieldSet.toNative(initialData))
  }
}

export class BaseApiForm<FS extends FieldSetRaw> extends Form<FS> {
  readonly definition: BaseApiFormDefinition<FS>

  constructor(formDefinition: BaseApiFormDefinition<FS>, data: FieldSetData<FS>) {
    super(formDefinition, data)
    this.definition = formDefinition
  }

  protected getApiURL(...args: any[]): string {
    if (typeof this.definition.url === 'function') return this.definition.url(...args)
    return this.definition.url
  }
}

export class BaseWritableApiFormDefinition<FS extends FieldSetRaw> extends BaseApiFormDefinition<FS> {}

export class BaseWritableApiForm<FS extends FieldSetRaw> extends BaseApiForm<FS> {
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
