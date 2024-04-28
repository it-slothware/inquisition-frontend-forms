import type { ConditionalNullable } from '../types'
import { type FormFieldValidator } from '../validators'
import { FlattenedErrors } from '@/logics/forms/form'
import { FieldBase } from '@/logics/apiInterfaces'

type FieldDefault<T, P extends boolean> = ConditionalNullable<T, P> | (() => ConditionalNullable<T, P>)

export type FormFieldSetRaw = { [key: string]: FormFieldBase<any, any, any> | FormFieldSetRaw }

export type FormFieldSetRoot<T extends FormFieldSetRaw> = {
  [key in keyof T]: T[key] extends FormFieldBase<any, any, any>
    ? T[key]
    : T[key] extends FormFieldSetRaw
      ? FormFieldSet<T[key]>
      : never
}

export type FormData<T> = {
  [key in keyof T]: T[key] extends FormFieldBase<any, any, any>
    ? ReturnType<T[key]['getDefault']>
    : T[key] extends FormFieldSetRaw
      ? FormData<T[key]>
      : never
}

type ArrayFieldDefault<T extends FormFieldSetRaw | FormFieldBase<any, any, any>> =
  T extends FormFieldBase<any, any, any> ? ReturnType<T['getDefault']> : FormData<T>

export type InferFormFieldType<T> = T extends FormFieldBase<any, infer R, any> ? R : never

export type FormFieldSetFieldNames<T> = {
  [K in keyof T]: T[K] extends FormFieldSet<any, any>
    ? K | `${K & string}.${FormFieldSetFieldNames<any> & string}`
    : T[K] extends ArrayFormField<any, infer R, any, any>
      ? R extends FormFieldSetRaw
        ? K | `${K & string}.0` | `${K & string}.0.${FormFieldSetFieldNames<R> & string}`
        : K | `${K & string}.0`
      : T[K] extends FormFieldBase<any, any, any>
        ? K
        : never
}[keyof T] &
  string

// Error handling related code
export type ErrorList = Array<string>

export type FieldSetErrors<T> = {
  [key in keyof T]: T[key] extends FormFieldBase<any, any, any>
    ? T[key] extends ArrayFormField<any, infer R, any, any>
      ? R extends FormFieldSet<any, any>
        ? ArrayFieldErrors<FieldSetErrors<R>>
        : R extends FormFieldSetRaw
          ? ArrayFieldErrors<FieldSetErrors<R>>
          : ArrayFieldErrors<FieldErrors>
      : FieldErrors
    : T[key] extends FormFieldSetRaw
      ? FieldSetErrors<T[key]>
      : never
} & { non_field_errors: ErrorList }

export class FieldErrors extends Array<string> {}
export class ArrayFieldErrors<T> extends Array<T> {
  non_field_errors: ErrorList

  constructor(...args: any[]) {
    super(...args)
    this.non_field_errors = []
  }
}

// Error handling part 2, just because perfection is still a dream

// Form fields and other creatures
export class FormFieldBase<L, DV, P extends boolean = false> {
  readonly label: string
  readonly #defaultValue: FieldDefault<DV, P>
  readonly nullable: boolean
  readonly validators: FormFieldValidator<ConditionalNullable<DV, P>>[]

  constructor(
    label: string,
    defaultValue: FieldDefault<DV, P>,
    nullable?: P,
    validators?: FormFieldValidator<ConditionalNullable<DV, P>>[],
  ) {
    this.label = label
    this.#defaultValue = defaultValue
    this.nullable = !!nullable
    this.validators = validators || []
  }

  getDefault(): ConditionalNullable<DV, P> {
    if (this.#defaultValue instanceof Function) return this.#defaultValue()
    return this.#defaultValue
  }

  validate(value: ConditionalNullable<DV, P>): FieldErrors {
    const errors: FieldErrors = []
    this.validators.forEach((validatorFunction) => {
      const result = validatorFunction(value)
      if (result === undefined || result === null) return
      if (Array.isArray(result)) errors.push(...result)
      else errors.push(result)
    })
    return errors
  }
}

export class HiddenFormField<DV, P extends boolean = false> extends FormFieldBase<string, DV, P> {
  constructor(defaultValue: FieldDefault<DV, P>, nullable?: P) {
    super('', defaultValue, nullable)
  }
}

// Don't touch these constructors. It seems like they are not doing anything (because it's true),
// but if you remove them the type definition falls apart because fuck you.
export class CharFormField<L, DV, P extends boolean = false> extends FormFieldBase<string, string, P> {
  constructor(
    label: string,
    defaultValue: FieldDefault<string, P>,
    nullable?: P,
    validators?: FormFieldValidator<FieldDefault<string, P>>[],
  ) {
    super(label, defaultValue, nullable, validators)
  }
}

export class NumberFormField<L, DV, P extends boolean = false> extends FormFieldBase<string, number, P> {
  constructor(
    label: string,
    defaultValue: FieldDefault<number, P>,
    nullable?: P,
    validators?: FormFieldValidator<FieldDefault<number, P>>[],
  ) {
    super(label, defaultValue, nullable, validators)
  }
}

export class BooleanFormField<L, DV, P extends boolean = false> extends FormFieldBase<string, boolean, P> {
  constructor(
    label: string,
    defaultValue: FieldDefault<boolean, P>,
    nullable?: P,
    validators?: FormFieldValidator<FieldDefault<boolean, P>>[],
  ) {
    super(label, defaultValue, nullable, validators)
  }
}

export class DateFormField<L, DV, P extends boolean = false> extends FormFieldBase<string, Date, P> {
  constructor(
    label: string,
    defaultValue: FieldDefault<Date, P>,
    nullable?: P,
    validators?: FormFieldValidator<FieldDefault<Date, P>>[],
  ) {
    super(label, defaultValue, nullable, validators)
  }
}

export class DateTimeFormField<L, DV, P extends boolean = false> extends FormFieldBase<string, Date, P> {
  constructor(
    label: string,
    defaultValue: FieldDefault<Date, P>,
    nullable?: P,
    validators?: FormFieldValidator<FieldDefault<Date, P>>[],
  ) {
    super(label, defaultValue, nullable, validators)
  }
}

export class ArrayFormField<
  L extends string,
  T extends FormFieldSetRaw | FormFieldBase<any, any, any>,
  IL extends number,
  P extends boolean = false,
> extends FormFieldBase<string, FormData<T>[], P> {
  // TODO fix typing here ^
  readonly baseField: FormFieldBase<any, any, any>
  readonly initialLength: number

  constructor(
    label: string,
    baseField: T,
    initialLength?: number,
    nullable?: P,
    validators?: FormFieldValidator<FieldDefault<any, P>>[],
  ) {
    if (!initialLength) initialLength = 0
    super(label, [] as ConditionalNullable<FormData<T>[], P>, nullable, validators)

    if (isFormField(baseField)) this.baseField = baseField
    else this.baseField = new FormFieldSet(baseField)
    this.baseField.bind(this)

    this.initialLength = initialLength
  }

  override getDefault(): ConditionalNullable<ArrayFieldDefault<T>[], P> {
    const defaultValue: ArrayFieldDefault<T>[] = []
    for (let i = 0; i < this.initialLength; i++) {
      defaultValue.push(this.baseField.getDefault())
    }
    return defaultValue
  }

  validateArray(value: ConditionalNullable<any[], P>): FlattenedErrors {
    const errors: FlattenedErrors = {}
    errors.non_field_errors = this.validate(value)

    if (this.nullable && value === null) return errors

    if (value !== null) {
      value.forEach((v, index) => {
        if (this.baseField instanceof FormFieldSet) {
          extendErrors(errors, this.baseField.validateFieldSet(v), index.toString())
        } else if (this.baseField instanceof ArrayFormField) {
          extendErrors(errors, this.baseField.validateArray(v), index.toString())
        } else {
          errors[index.toString()] = this.baseField.validate(v)
        }
      })
    }

    return errors
  }
}

export class FormFieldSet<DV extends FormFieldSetRaw, P extends boolean = false> extends FormFieldBase<
  string,
  ConditionalNullable<FormData<DV>, P>,
  P
> {
  readonly fieldSetRoot: FormFieldSetRoot<DV>

  constructor(
    fieldSetRaw: DV,
    nullable?: P,
    validators?: FormFieldValidator<FieldDefault<ConditionalNullable<FormData<DV>, P>, P>>[],
  ) {
    super('', {} as FormData<DV>, nullable, validators)
    const normalizedFieldSetRaw: Record<string, FormFieldBase<any, any, any>> = {}

    for (const [fieldName, field] of Object.entries(fieldSetRaw)) {
      if (isFormField(field)) normalizedFieldSetRaw[fieldName] = field
      else normalizedFieldSetRaw[fieldName] = new FormFieldSet(field)
      normalizedFieldSetRaw[fieldName].bind(this)
    }

    this.fieldSetRoot = normalizedFieldSetRaw as FormFieldSetRoot<DV>
  }

  override getDefault(): ConditionalNullable<FormData<DV>, P> {
    // if (this.nullable) return null as ConditionalNullable<FormData<DV>, P>

    const defaultValue: Record<string, any> = {}
    for (const fieldName of Object.keys(this.fieldSetRoot)) {
      const field = this.fieldSetRoot[fieldName]
      defaultValue[fieldName] = field.getDefault()
    }
    return defaultValue as ConditionalNullable<FormData<DV>, P>
  }

  validateFieldSet(data: FormData<DV>): FlattenedErrors {
    const errors: FlattenedErrors = {}
    errors.non_field_errors = this.validate(data)

    if (this.nullable && data === null) return errors

    for (const fieldName of Object.keys(this.fieldSetRoot)) {
      const field = this.fieldSetRoot[fieldName]

      if (isFormFieldSet(field)) {
        extendErrors(errors, field.validateFieldSet(data[fieldName]), fieldName)
      } else if (isArrayField(field)) {
        const dataArray = data[fieldName]
        if (Array.isArray(dataArray)) {
          extendErrors(errors, field.validateArray(dataArray), fieldName)
        }
      } else {
        errors[fieldName] = field.validate(data[fieldName])
      }
    }

    return errors
  }
}

function extendErrors(original: FlattenedErrors, additional: FlattenedErrors, prefix: string): FlattenedErrors {
  Object.entries(additional).forEach(([key, value]) => {
    original[`${prefix}.${key}`] = value
  })
  return original
}

export function isFormField(
  field: FormFieldBase<any, any, any> | FormFieldSetRaw,
): field is FormFieldBase<any, any, any> {
  return field instanceof FormFieldBase
}

export function isArrayField(
  field: FormFieldBase<any, any, any> | FormFieldSetRaw,
): field is ArrayFormField<any, any, any, any> {
  return field instanceof ArrayFormField
}

export function isFormFieldSet(field: FormFieldBase<any, any, any> | FormFieldSetRaw): field is FormFieldSet<any> {
  return field instanceof FormFieldSet
}

export type IdTypeFromFormFieldSet<FS extends FormFieldSetRaw> = FS extends { id: FormFieldBase<any, any, any> }
  ? InferFormFieldType<FS['id']>
  : never
