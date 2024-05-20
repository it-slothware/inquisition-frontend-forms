import { computed, ComputedRef, ref, Ref } from 'vue'

import {
  type FormData,
  type ErrorList,
  FieldBase,
  FieldSetRaw,
  FieldSet,
  FieldSetErrors,
  ArrayField,
  ArrayFieldErrors,
  isArrayField,
  isFormFieldSet,
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

type ArrayFieldAccessors<T extends ArrayField<any, any>> =
  T extends ArrayField<infer R, any>
    ? R extends FieldBase<any, any>
      ? R extends ArrayField<any, any>
        ? '0' | `0.${ArrayFieldAccessors<R>}`
        : never
      : `0.${ArrayFieldNames<R>}`
    : never

type ArrayFieldNames<T> = {
  [K in keyof T]: T[K] extends FieldBase<any, any>
    ? T[K] extends ArrayField<any, any>
      ? (K & string) | `${K & string}.${ArrayFieldAccessors<T[K]>}`
      : never
    : T[K] extends FieldSetRaw
      ? `${K & string}.${ArrayFieldNames<T[K]>}`
      : never
}[keyof T]

type GetReturnTypeIfFunction<T> = T extends (...args: any[]) => any ? ReturnType<T> : never
type InferBaseFromArrayField<T extends ArrayField<any, any>> = T extends ArrayField<infer R, any> ? R : never

type DataTypeFromArrayField<T extends readonly unknown[], K extends ArrayField<any, any>> = T['length'] extends 1
  ? T extends ['0']
    ? GetReturnTypeIfFunction<InferBaseFromArrayField<K>['getDefault']>[number]
    : never
  : T extends [infer A, ...infer B]
    ? K extends ArrayField<infer R, any>
      ? R extends FieldBase<any, any>
        ? R extends ArrayField<any, any>
          ? DataTypeFromArrayField<[...B], R>
          : GetReturnTypeIfFunction<R['getDefault']>[number]
        : R extends FieldSetRaw
          ? DataTypeFromFormFieldSetRaw<[...B], R>
          : never
      : never
    : never

type DataTypeFromFormFieldSetRaw<T extends readonly unknown[], K extends FieldSetRaw> = T['length'] extends 1
  ? T[0] extends keyof K
    ? GetReturnTypeIfFunction<K[T[0]]['getDefault']>[number]
    : never
  : T extends [infer A, ...infer B]
    ? A extends keyof K & string
      ? K[A] extends ArrayField<any, any>
        ? DataTypeFromArrayField<[...B], K[A]>
        : K[A] extends FieldSetRaw
          ? DataTypeFromFormFieldSetRaw<[...B], K[A]>
          : never
      : never
    : never

type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
    ? []
    : S extends `${infer T}${D}${infer U}`
      ? [T, ...Split<U, D>]
      : [S]

type CountOfSubString<
  T extends string,
  S extends string,
  C extends unknown[] = [],
> = T extends `${string}${S}${infer R}` ? CountOfSubString<R, S, [1, ...C]> : C['length']
type NPlusOne<T extends number, C extends unknown[] = []> = C['length'] extends T
  ? [...C, 1]['length']
  : NPlusOne<T, [...C, 1]>

type IndexArray<T, K extends any[] = []> = K['length'] extends T ? K : IndexArray<T, [...K, number]>
type PushRelatedArguments<T extends string, FS extends FieldSetRaw> = [
  ...IndexArray<CountOfSubString<T, '.0'>>,
  DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>?,
]
export type RelatedLookupIndexes<T extends string> = IndexArray<NPlusOne<CountOfSubString<T, '.0'>>>

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

  getRelated<T extends ArrayFieldNames<FS>>(relatedName: T): DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS> {
    const relatedAccessors = relatedName.split('.')

    let relatedField: FieldBase<any, any> = this.definition.fieldSet
    relatedAccessors.forEach((ra) => {
      if (isArrayField(relatedField)) {
        if (isFormFieldSet(relatedField.baseField)) {
          if (ra === '0') return
          relatedField = relatedField.baseField
        } else if (ra === '0' && isArrayField(relatedField.baseField)) {
          relatedField = relatedField.baseField
        }
      }
      if (isFormFieldSet(relatedField)) relatedField = relatedField.fieldSetRoot[ra]
    })

    if (isArrayField(relatedField)) {
      return relatedField.baseField.getDefault() as DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>
    } else {
      return relatedField.getDefault() as DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>
    }
  }

  pushRelated<T extends ArrayFieldNames<FS>>(
    relatedName: T,
    ...args: PushRelatedArguments<T, FS>
  ): DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS> {
    const expectedIndexCount = (relatedName.match(/\.0/g) || []).length

    let data
    if (expectedIndexCount < args.length) {
      data = args.at(-1) as DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>
    } else {
      data = this.getRelated(relatedName)
    }

    let foundIndexes = 0
    // TODO fix this any maybe if too much time or bored or anything
    let pushTarget = this.data.value as any
    relatedName.split('.').forEach((p) => {
      let key
      if (p !== '0') key = p
      else {
        foundIndexes += 1
        key = args[foundIndexes - 1]
      }
      pushTarget = pushTarget[key]
    })
    pushTarget.push(data)

    return data
  }
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
