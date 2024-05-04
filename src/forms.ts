import { computed, ComputedRef, ref, Ref } from 'vue'

import {
  type FormData,
  type ErrorList,
  FieldSetRaw,
  FieldSet,
  FieldSetErrors,
  ArrayField,
  ArrayFieldErrors,
} from './fields'

export type FormExtraMethod<T> = (this: T, ...args: any[]) => any
export type FormExtraMethodsDefinition<F extends Form<any>> = {
  [key: string]: FormExtraMethod<F>
}

export type FormExtraMethods<F extends Form<any>, EMD extends FormExtraMethodsDefinition<F>> = {
  [key in keyof EMD]: (...args: Parameters<EMD[key]>) => ReturnType<EMD[key]>
}

export type FormWithExtraMethods<F extends Form<any>, EMD extends FormExtraMethodsDefinition<F>> = F &
  FormExtraMethods<F, EMD>

export type FlattenedErrors = Record<string, ErrorList>

export type CallbackFunction = (success: boolean) => void

export class FormDefinition<FS extends FieldSetRaw, EMD extends FormExtraMethodsDefinition<Form<FS>>> {
  readonly fieldSet: FieldSet<FS>
  readonly extraMethods: EMD

  constructor(rawFieldSet: FS, extraMethods?: EMD) {
    this.fieldSet = new FieldSet(rawFieldSet)
    if (!extraMethods) extraMethods = {} as EMD
    this.extraMethods = extraMethods
  }

  new(initialData?: Partial<FormData<FS>>): FormWithExtraMethods<Form<FS>, EMD> {
    const data: FormData<FS> = this.fieldSet.getDefault()
    if (initialData) {
      Object.assign(data, initialData)
    }
    return new Form<FS>(this, data) as FormWithExtraMethods<Form<FS>, EMD>
  }
}

export class Form<FS extends FieldSetRaw> {
  protected readonly definition: FormDefinition<FS, FormExtraMethodsDefinition<any>>
  protected readonly validationErrors: Ref<FlattenedErrors>

  readonly data: Ref<FormData<FS>>
  readonly errors: ComputedRef<FieldSetErrors<FS>>
  readonly hasErrors: ComputedRef<boolean>

  constructor(formDefinition: FormDefinition<FS, FormExtraMethodsDefinition<any>>, data: FormData<FS>) {
    this.definition = formDefinition
    this.validationErrors = ref({})

    this.data = ref<FormData<FS>>(this.definition.fieldSet.getDefault()) as Ref<FormData<FS>>
    this.errors = computed(() => this.unflattenErrors())
    this.hasErrors = computed(() => this.hasAnyError())
  }

  private unflattenErrors(): FieldSetErrors<FS> {
    return this.#unflattenFieldSetErrors(this.definition.fieldSet, []) as FieldSetErrors<FS>
  }

  #unflattenFieldSetErrors(fieldSet: FieldSet<any>, accessors: string[]): Record<string, any> {
    const errors: Record<string, any> = {}

    for (const [fieldName, field] of Object.entries(fieldSet.fieldSetRoot)) {
      if (field instanceof FieldSet) {
        errors[fieldName] = this.#unflattenFieldSetErrors(field, [...accessors, fieldName])
      } else if (field instanceof ArrayField) {
        const arrayErrors = new ArrayFieldErrors()
        arrayErrors.non_field_errors = this.getFlatError([...accessors, fieldName].join('.'))
        errors[fieldName] = arrayErrors
      } else {
        errors[fieldName] = this.getFlatError([...accessors, fieldName].join('.'))
      }
    }

    return errors
  }

  protected getFlatError(accessor: string): ErrorList {
    return this.validationErrors.value[accessor] || []
  }

  protected hasAnyError(): boolean {
    return Object.values(this.validationErrors.value).filter((e) => e.length > 0).length > 0
  }

  resetErrors() {
    this.validationErrors.value = {}
  }

  reset() {
    this.data.value = this.definition.fieldSet.getDefault()
    this.resetErrors()
  }

  validate() {
    this.resetErrors()
    this.validationErrors.value = this.definition.fieldSet.validateFieldSet(this.data.value)
  }

  // getRelated<T extends ArrayFieldNames<FS>>(relatedName: T): DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS> {
  //   const relatedAccessors = relatedName.split('.').filter((ra) => ra !== '0')
  //
  //   let relatedField: FormFieldBase<any, any, any> = this.definition.fieldSet
  //   relatedAccessors.forEach((ra) => {
  //     if (isArrayField(relatedField) && isFormFieldSet(relatedField.baseField)) {
  //       relatedField = relatedField.baseField
  //     }
  //     if (isFormFieldSet(relatedField)) relatedField = relatedField.fieldSetRoot[ra]
  //   })
  //
  //   if (isArrayField(relatedField)) {
  //     return relatedField.baseField.getDefault() as DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>
  //   } else {
  //     return relatedField.getDefault() as DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>
  //   }
  // }
  //
  // pushRelated<T extends ArrayFieldNames<FS>>(
  //   relatedName: T,
  //   ...args: PushRelatedArguments<T, FS>
  // ): DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS> {
  //   const expectedIndexCount = (relatedName.match(/\.0/g) || []).length
  //
  //   let data
  //   if (expectedIndexCount > args.length) {
  //     data = args.at(-1) as DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>
  //   } else {
  //     data = this.getRelated(relatedName)
  //   }
  //
  //   let foundIndexes = 0
  //   // TODO fix this any maybe if too much time or bored or anything
  //   let pushTarget = this.data.value as any
  //   relatedName.split('.').forEach((p) => {
  //     let key
  //     if (p !== '0') key = p
  //     else {
  //       foundIndexes += 1
  //       key = args[foundIndexes - 1]
  //     }
  //     pushTarget = pushTarget[key]
  //   })
  //   pushTarget.push(data)
  //
  //   return data
  // }
  //
  // removeRelated<T extends ArrayFieldNames<FS>>(relatedName: T, ...args: RelatedLookupIndexes<T>) {
  //   const indexes = args as number[]
  //   let foundIndexes = 0
  //   let removeTarget = this.data.value as any
  //   relatedName.split('.').forEach((p) => {
  //     let key
  //     if (p !== '0') key = p
  //     else {
  //       foundIndexes += 1
  //       key = indexes[foundIndexes - 1]
  //     }
  //     removeTarget = removeTarget[key]
  //   })
  //
  //   removeTarget.splice(indexes[foundIndexes], 1)
  // }
}
