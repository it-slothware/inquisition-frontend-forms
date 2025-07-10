import { computed, ComputedRef, ref, Ref } from 'vue'

import type { Add, CreateArrayOfLength } from './types'
import {
  type ErrorList,
  type FieldSetData,
  type FlattenedErrors,
  FieldBase,
  FieldSetRaw,
  FieldSet,
  FieldSetErrors,
  ArrayField,
  ArrayFieldErrors,
  isArrayField,
  isFormFieldSet,
} from './fields'
import { range } from './utils'
import { ReadOnlyEndpointFormDefinition, SingleEndpointFormDefinition, CrudAPIFormDefinition } from './apiInterfaces'

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

type ArrayFieldNamesFromArrayField<T extends ArrayField<any, any>, C extends unknown[]> = C extends [...infer CR, any]
  ? T extends ArrayField<infer R, any>
    ? R extends FieldSetRaw
      ? `0.${ArrayFieldNamesFromFieldSetRaw<R, CR> & string}`
      : R extends FieldBase<any, any>
      ? R extends FieldSet<infer Q, any>
        ? `0.${ArrayFieldNamesFromFieldSetRaw<Q, CR> & string}`
        : R extends ArrayField<any, any>
        ? '0' | `0.${ArrayFieldNamesFromArrayField<R, CR> & string}`
        : never
      : never
    : never
  : never

type ArrayFieldNamesFromFieldSetRaw<T extends FieldSetRaw, C extends unknown[]> = {
  [K in keyof T]: C extends [...infer CR, any]
    ? T[K] extends FieldSetRaw
      ? `${K & string}.${ArrayFieldNamesFromFieldSetRaw<T[K], CR>}`
      : T[K] extends FieldSet<infer R, any>
      ? `${K & string}.${ArrayFieldNamesFromFieldSetRaw<R, CR>}`
      : T[K] extends ArrayField<any, any>
      ? `${K & string}` | `${K & string}.${ArrayFieldNamesFromArrayField<T[K], CR>}`
      : never
    : never
}[keyof T]

type ArrayFieldNames<FS extends FieldSetRaw, D extends number = 15> = ArrayFieldNamesFromFieldSetRaw<
  FS,
  CreateArrayOfLength<D>
>

type FieldNamesFromArrayField<T extends ArrayField<any, any>, C extends unknown[]> = C extends [...infer CR, any]
  ? T extends ArrayField<infer R, any>
    ? R extends FieldSetRaw
      ? '0' | `0.${FieldNamesFromFieldSetRaw<R, CR> & string}`
      : R extends FieldBase<any, any>
      ? R extends FieldSet<infer Q, any>
        ? `0.${FieldNamesFromFieldSetRaw<Q, CR> & string}`
        : R extends ArrayField<any, any>
        ? '0' | `0.${FieldNamesFromArrayField<R, CR> & string}`
        : '0'
      : never
    : never
  : never

export type FieldNamesFromFieldSetRaw<T extends FieldSetRaw, C extends unknown[]> = {
  [K in keyof T]: C extends [...infer CR, any]
    ? T[K] extends FieldSetRaw
      ? `${K & string}` | `${K & string}.${FieldNamesFromFieldSetRaw<T[K], CR> & string}`
      : T[K] extends FieldSet<infer R, any>
      ? `${K & string}` | `${K & string}.${FieldNamesFromFieldSetRaw<R, CR> & string}`
      : T[K] extends ArrayField<any, any>
      ? `${K & string}` | `${K & string}.${FieldNamesFromArrayField<T[K], CR> & string}`
      : T[K] extends FieldBase<any, any>
      ? K
      : never
    : never
}[keyof T]

export type FieldNames<T extends FormType> = T extends CrudAPIFormDefinition<infer R>
  ? FieldNamesFromFieldSetRaw<R, CreateArrayOfLength<15>>
  : T extends SingleEndpointFormDefinition<infer R>
  ? FieldNamesFromFieldSetRaw<R, CreateArrayOfLength<15>>
  : T extends ReadOnlyEndpointFormDefinition<infer R>
  ? FieldNamesFromFieldSetRaw<R, CreateArrayOfLength<15>>
  : T extends FormDefinition<infer R>
  ? FieldNamesFromFieldSetRaw<R, CreateArrayOfLength<15>>
  : T extends FieldSetRaw
  ? FieldNamesFromFieldSetRaw<T, CreateArrayOfLength<15>>
  : never

type GetReturnTypeIfFunction<T> = T extends (...args: any[]) => any ? ReturnType<T> : never
type InferBaseFromArrayField<T extends ArrayField<any, any>> = T extends ArrayField<infer R, any> ? R : never

type DataTypeFromArrayField<T extends readonly unknown[], K extends ArrayField<any, any>> = T['length'] extends 1
  ? T extends ['0']
    ? GetReturnTypeIfFunction<InferBaseFromArrayField<K>['getDefault']>[number]
    : never
  : T extends [any, ...infer B]
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

type IndexArray<T, K extends any[] = []> = K['length'] extends T ? K : IndexArray<T, [...K, number]>
type PushRelatedArguments<T extends string, FS extends FieldSetRaw> = [
  ...IndexArray<CountOfSubString<T, '.0'>>,
  DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>?,
]
export type RelatedLookupIndexes<T extends string> = IndexArray<Add<CountOfSubString<T, '.0'>>>

export class FormDefinition<FS extends FieldSetRaw> {
  readonly fieldSet: FieldSet<FS>

  constructor(rawFieldSet: FS) {
    this.fieldSet = new FieldSet(rawFieldSet)
  }

  new(initialData?: Partial<FieldSetData<FS>>): Form<FS> {
    const data: FieldSetData<FS> = this.fieldSet.getDefault()
    if (initialData) {
      Object.assign(data, initialData)
    }
    return new Form<FS>(this, data)
  }
}

export class Form<FS extends FieldSetRaw> {
  protected readonly definition: FormDefinition<FS>
  protected readonly validationErrors: Ref<FlattenedErrors>

  readonly data: Ref<FieldSetData<FS>>
  readonly errors: ComputedRef<FieldSetErrors<FS>>
  readonly hasErrors: ComputedRef<boolean>

  constructor(formDefinition: FormDefinition<FS>, data: FieldSetData<FS>) {
    this.definition = formDefinition
    this.validationErrors = ref({})

    this.data = ref<FieldSetData<FS>>(this.definition.fieldSet.getDefault()) as Ref<FieldSetData<FS>>
    this.errors = computed(() => this.hydrateErrors())
    this.hasErrors = computed(() => this.hasAnyError())
  }

  protected hydrateErrors(): FieldSetErrors<FS> {
    return this.hydrateFieldSetErrors(this.definition.fieldSet, []) as FieldSetErrors<FS>
  }

  private hydrateFieldSetErrors(fieldSet: FieldSet<any>, accessors: string[]): Record<string, any> {
    const errors: Record<string, any> = {
      non_field_errors: this.getFlatError([...accessors, 'non_field_errors'].join('.')),
    }

    const fieldSetData = this.getDataByKeys(accessors)
    if (fieldSetData === null && fieldSet.nullable) {
      return errors
    }

    for (const [fieldName, field] of Object.entries(fieldSet.fieldSetRoot)) {
      if (field instanceof FieldSet) {
        errors[fieldName] = this.hydrateFieldSetErrors(field, [...accessors, fieldName])
      } else if (field instanceof ArrayField) {
        const arrayErrors = new ArrayFieldErrors()
        const dataArray = this.getDataByKeys([...accessors, fieldName])
        if (dataArray !== null && Array.isArray(dataArray)) {
          range(dataArray.length).forEach((i) => {
            if (field.baseField instanceof FieldSet) {
              arrayErrors.push(this.hydrateFieldSetErrors(field.baseField, [...accessors, fieldName, `${i}`]))
            } else {
              arrayErrors.push(this.getFlatError([...accessors, fieldName, `${i}`].join('.')))
            }
          })
        }
        arrayErrors.non_field_errors = this.getFlatError([...accessors, fieldName, 'non_field_errors'].join('.'))
        errors[fieldName] = arrayErrors
      } else {
        errors[fieldName] = this.getFlatError([...accessors, fieldName].join('.'))
      }
    }

    return errors
  }

  protected getDataByKeys(accessors: string[]): any {
    let value: any = this.data.value
    accessors.forEach((key) => {
      value = value[key]
    })
    return value
  }

  protected getFlatError(accessor: string): ErrorList {
    return this.validationErrors.value[accessor] || []
  }

  protected hasAnyError(): boolean {
    return Object.values(this.validationErrors.value).filter((e) => e.length > 0).length > 0
  }

  hasFieldErrors(fieldNames: string | string[]): boolean {
    if (!Array.isArray(fieldNames)) {
      fieldNames = [fieldNames]
    }

    return fieldNames
      .map((fn) => {
        if (fn.endsWith('*')) {
          fn = fn.slice(0, -1)
          return Object.keys(this.validationErrors.value)
            .filter((k) => k.startsWith(fn))
            .map((k) => this.getFlatError(k).length > 0)
            .reduce((a, b) => a || b, false)
        }
        return this.getFlatError(fn).length > 0
      })
      .reduce((a, b) => a || b, false)
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

    let data: DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>
    if (expectedIndexCount < args.length) {
      data = args.at(-1) as DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>
    } else {
      data = this.getRelated(relatedName) as DataTypeFromFormFieldSetRaw<Split<T, '.'>, FS>
    }

    let foundIndexes = 0
    let pushTarget: any = this.data.value
    const traversedKey: string[] = []
    relatedName.split('.').forEach((p) => {
      let key: any
      if (p !== '0') key = p
      else {
        foundIndexes += 1
        key = args[foundIndexes - 1]
      }
      pushTarget = pushTarget[key]
      if (pushTarget === undefined) {
        console.error(
          `Target is undefined. Possibly a key error during traversal. Traversed key: ${traversedKey.join('.')}`,
        )
      } else {
        traversedKey.push(`${key}`)
      }
    })
    pushTarget.push(data)

    return data
  }

  removeRelated<T extends ArrayFieldNames<FS>>(relatedName: T, ...args: RelatedLookupIndexes<T>) {
    const indexes = args as number[]
    let foundIndexes = 0
    let removeTarget: any = this.data.value
    relatedName.split('.').forEach((p) => {
      let key: any
      if (p !== '0') key = p
      else {
        foundIndexes += 1
        key = indexes[foundIndexes - 1]
      }
      removeTarget = removeTarget[key]
    })

    removeTarget.splice(indexes[foundIndexes], 1)
  }
}

export function formDefinition<FS extends FieldSetRaw>(rawFieldSet: FS) {
  return new FormDefinition(rawFieldSet)
}

export type FormType =
  | FormDefinition<any>
  | ReadOnlyEndpointFormDefinition<any>
  | SingleEndpointFormDefinition<any>
  | CrudAPIFormDefinition<any>
