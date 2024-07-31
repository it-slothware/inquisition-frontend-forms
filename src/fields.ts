import { type FormFieldValidator } from './validators'

export type ConditionalNullable<T, P extends boolean> = P extends true ? T | null : T
export type FieldDefault<T, P extends boolean> = ConditionalNullable<T, P> | (() => ConditionalNullable<T, P>)

export type FieldSetRaw = { [key: string]: FieldBase<any, any> | FieldSetRaw }

export type FormFieldSetRoot<T extends FieldSetRaw> = {
  [key in keyof T]: T[key] extends FieldBase<any, any> ? T[key] : T[key] extends FieldSetRaw ? FieldSet<T[key]> : never
}

export type FieldSetData<T> = {
  [key in keyof T]: T[key] extends FieldBase<any, any>
    ? ReturnType<T[key]['getDefault']>
    : T[key] extends FieldSetRaw
      ? FieldSetData<T[key]>
      : never
}

export type ArrayFieldDefault<T extends FieldSetRaw | FieldBase<any, any>> =
  T extends FieldBase<any, any> ? ReturnType<T['getDefault']> : FieldSetData<T>

type ArrayFieldFromNative<T extends FieldSetRaw | FieldBase<any, any>> =
  T extends FieldBase<any, any> ? ReturnType<T['fromNative']> : FieldSetData<T>

export type ErrorList = Array<string>
export type FlattenedErrors = Record<string, ErrorList>

export type oldFieldSetErrors<T> = {
  [key in keyof T]: T[key] extends FieldBase<any, any>
    ? T[key] extends ArrayField<infer R, any>
      ? R extends FieldSet<infer P, any>
        ? ArrayFieldErrors<FieldSetErrors<P>>
        : R extends FieldSetRaw
          ? ArrayFieldErrors<FieldSetErrors<R>>
          : ArrayFieldErrors<ErrorList>
      : ErrorList
    : T[key] extends FieldSetRaw
      ? FieldSetErrors<T[key]>
      : never
} & { non_field_errors: ErrorList }

export type FieldSetErrors<T extends FieldSetRaw> = {
  [key in keyof T]: T[key] extends FieldSetRaw
    ? FieldSetErrors<T[key]>
    : T[key] extends ArrayField<infer R, any>
      ? R extends FieldSetRaw
        ? ArrayFieldErrors<FieldSetErrors<R>>
        : R extends FieldSet<infer FS, any>
          ? ArrayFieldErrors<FieldSetErrors<FS>>
          : ArrayFieldErrors<ErrorList>
      : T[key] extends FieldSet<infer FS, any>
        ? FieldSetErrors<FS>
        : T[key] extends FieldBase<any, any>
          ? ErrorList
          : never
} & { non_field_errors: ErrorList }

export class ArrayFieldErrors<T> extends Array<T> {
  non_field_errors: ErrorList

  constructor(...args: any[]) {
    super(...args)
    this.non_field_errors = []
  }
}

export class FieldBase<DV, P extends boolean = false> {
  readonly label: string
  protected readonly defaultValue: FieldDefault<DV, P>
  readonly nullable: boolean
  readonly validators: FormFieldValidator[]

  constructor(label: string, defaultValue: FieldDefault<DV, P>, nullable?: P, validators?: FormFieldValidator[]) {
    this.label = label
    this.defaultValue = defaultValue
    this.nullable = !!nullable
    this.validators = validators || []
  }

  getDefault(): ConditionalNullable<DV, P> {
    if (this.defaultValue instanceof Function) return this.defaultValue()
    return this.defaultValue
  }

  toNative(rawValue: any): ConditionalNullable<DV, P> {
    return rawValue as ConditionalNullable<DV, P>
  }

  fromNative(value: ConditionalNullable<DV, P>): any {
    return value
  }

  validate(value: ConditionalNullable<DV, P>): ErrorList {
    const errors: ErrorList = []

    this.validators.forEach((validatorFunction) => {
      const result = validatorFunction(value)
      if (result === undefined || result === null) return
      if (Array.isArray(result)) errors.push(...result)
      else errors.push(result)
    })

    return errors
  }
}

export class BooleanField<P extends boolean = false> extends FieldBase<boolean, P> {
  constructor(label: string, defaultValue: FieldDefault<boolean, P>, nullable?: P, validators?: FormFieldValidator[]) {
    super(label, defaultValue, nullable, validators)
  }

  toNative(rawValue: any): ConditionalNullable<boolean, P> {
    if (this.nullable && rawValue === null) return null as ConditionalNullable<boolean, P>
    if (typeof rawValue !== 'boolean') {
      console.warn(`Invalid data type: expected boolean, got ${typeof rawValue}`)
    }
    if (typeof rawValue === 'object') {
      if (rawValue === null) return false
      if (Array.isArray(rawValue)) return rawValue.length > 0
      return Object.keys(rawValue).length > 0
    }
    return !!rawValue
  }

  fromNative(value: ConditionalNullable<boolean, P>): ConditionalNullable<boolean, P> {
    if (this.nullable && value === null) return null as ConditionalNullable<boolean, P>
    return !!value
  }
}

export class CharField<P extends boolean = false> extends FieldBase<string, P> {
  constructor(label: string, defaultValue: FieldDefault<string, P>, nullable?: P, validators?: FormFieldValidator[]) {
    super(label, defaultValue, nullable, validators)
  }

  toNative(rawValue: any): ConditionalNullable<string, P> {
    if (this.nullable && rawValue === null) return null as ConditionalNullable<string, P>
    if (typeof rawValue === 'object') {
      if (Array.isArray(rawValue)) return `[${String(rawValue)}]`
    }
    return String(rawValue)
  }

  fromNative(value: ConditionalNullable<string, P>): ConditionalNullable<string, P> {
    if (this.nullable && value === null) return null as ConditionalNullable<string, P>
    if (typeof value === 'string') return value
    return String(value)
  }
}

export class NumberField<P extends boolean = false> extends FieldBase<number, P> {
  constructor(label: string, defaultValue: FieldDefault<number, P>, nullable?: P, validators?: FormFieldValidator[]) {
    super(label, defaultValue, nullable, validators)
  }

  toNative(rawValue: any): ConditionalNullable<number, P> {
    if (this.nullable && rawValue === null) return null as ConditionalNullable<number, P>

    if (typeof rawValue === 'string') {
      rawValue = rawValue.replace(/(\d)\s+(\d)/g, '$1$2').trim()
      if (rawValue !== '') rawValue = Number(rawValue)
    }
    if (typeof rawValue === 'number' && !isNaN(rawValue)) return rawValue
    console.warn(`Invalid data type: expected number, got ${typeof rawValue}`)
    return 0
  }

  fromNative(value: ConditionalNullable<number, P>): ConditionalNullable<number, P> {
    if (this.nullable && value === null) return null as ConditionalNullable<number, P>
    if (typeof value === 'number') return value
    return Number(value)
  }
}

export class DateTimeField<P extends boolean = false> extends FieldBase<Date, P> {
  constructor(label: string, defaultValue: FieldDefault<Date, P>, nullable?: P, validators?: FormFieldValidator[]) {
    super(label, defaultValue, nullable, validators)
  }

  toNative(rawValue: any): ConditionalNullable<Date, P> {
    if (this.nullable && rawValue === null) return null as ConditionalNullable<Date, P>

    if (typeof rawValue === 'string' && isNaN(Number(rawValue))) {
      const convertedDate = new Date(rawValue)
      if (!isNaN(convertedDate.getTime())) return convertedDate
    }

    console.warn(`Invalid data type: cannot convert ${typeof rawValue} to Date`)
    return new Date(1970, 0, 1)
  }

  fromNative(value: ConditionalNullable<Date, P>): ConditionalNullable<string, P> {
    if (value === null) return value as null as ConditionalNullable<string, P>
    return value.toISOString()
  }
}

export class DateField<P extends boolean = false> extends FieldBase<Date, P> {
  constructor(label: string, defaultValue: FieldDefault<Date, P>, nullable?: P, validators?: FormFieldValidator[]) {
    super(label, defaultValue, nullable, validators)
  }

  toNative(rawValue: any): ConditionalNullable<Date, P> {
    if (this.nullable && rawValue === null) return null as ConditionalNullable<Date, P>

    if (typeof rawValue === 'string' && isNaN(Number(rawValue))) {
      const convertedDate = new Date(rawValue)
      if (!isNaN(convertedDate.getTime())) return convertedDate
    }

    console.warn(`Invalid data type: cannot convert ${typeof rawValue} to Date`)
    return new Date(1970, 0, 1)
  }

  fromNative(value: ConditionalNullable<Date, P>): ConditionalNullable<string, P> {
    if (value === null) return value as null as ConditionalNullable<string, P>
    return value.toISOString().split('T', 1)[0]
  }
}

export class ArrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean = false> extends FieldBase<
  ArrayFieldDefault<T>[],
  P
> {
  readonly baseField: FieldBase<any, any>
  readonly initialLength: number

  constructor(
    label: string,
    baseField: T,
    defaultValue?: () => ConditionalNullable<ArrayFieldDefault<T>[], P>,
    initialLength?: number,
    nullable?: P,
    validators?: FormFieldValidator[],
  ) {
    if (initialLength === undefined) initialLength = 0
    if (defaultValue === undefined)
      defaultValue = () => {
        const generatedDefault: ArrayFieldDefault<T>[] = []
        for (let i = 0; i < this.initialLength; i++) {
          generatedDefault.push(this.baseField.getDefault())
        }
        return generatedDefault
      }

    super(label, defaultValue, nullable, validators)

    if (isFormField(baseField)) this.baseField = baseField
    else this.baseField = new FieldSet(baseField)

    this.initialLength = initialLength || 0
  }

  toNative(rawValue: any): ConditionalNullable<ArrayFieldDefault<T>[], P> {
    if (this.nullable && rawValue === null) return null as ConditionalNullable<ArrayFieldDefault<T>[], P>

    if (!Array.isArray(rawValue)) {
      console.warn(`Expected array, got: ${typeof rawValue}`)
      return []
    }
    return rawValue.map((v) => this.baseField.toNative(v))
  }

  fromNative(value: ConditionalNullable<ArrayFieldDefault<T>[], P>): ConditionalNullable<ArrayFieldFromNative<T>[], P> {
    if (value === null) return null as ConditionalNullable<ArrayFieldFromNative<T>[], P>
    return value.map((v) => this.baseField.fromNative(v))
  }

  validateArray(value: ConditionalNullable<any[], P>): FlattenedErrors {
    const errors: FlattenedErrors = {}
    errors.non_field_errors = this.validate(value)

    if (this.nullable && value === null) return errors

    if (value !== null) {
      value.forEach((v, index) => {
        if (this.baseField instanceof FieldSet) {
          extendErrors(errors, this.baseField.validateFieldSet(v), index.toString())
        } else if (this.baseField instanceof ArrayField) {
          extendErrors(errors, this.baseField.validateArray(v), index.toString())
        } else {
          errors[index.toString()] = this.baseField.validate(v)
        }
      })
    }

    return errors
  }
}

export type FieldSetDefault<T extends FieldSetRaw, P extends boolean = false> = () => ConditionalNullable<
  FieldSetData<T>,
  P
>

export class FieldSet<FS extends FieldSetRaw, P extends boolean = false> extends FieldBase<FieldSetData<FS>, P> {
  readonly fieldSetRoot: FormFieldSetRoot<FS>

  constructor(
    rawFieldSet: FS,
    label?: string,
    defaultValue?: FieldSetDefault<FS, P>,
    nullable?: P,
    validators?: FormFieldValidator[],
  ) {
    if (label === undefined) label = ''
    if (defaultValue === undefined) {
      defaultValue = () => {
        const defaultData: Record<string, any> = {}
        for (const fieldName of Object.keys(this.fieldSetRoot)) {
          const field = this.fieldSetRoot[fieldName]
          defaultData[fieldName] = field.getDefault()
        }
        return defaultData as ConditionalNullable<FieldSetData<FS>, P>
      }
    }
    super(label, defaultValue, nullable, validators)

    const normalizedFieldSetRaw: Record<string, FieldBase<any, any>> = {}

    for (const [fieldName, field] of Object.entries(rawFieldSet)) {
      if (isFormField(field)) normalizedFieldSetRaw[fieldName] = field
      else normalizedFieldSetRaw[fieldName] = new FieldSet(field)
    }

    this.fieldSetRoot = normalizedFieldSetRaw as FormFieldSetRoot<FS>
  }

  validateFieldSet(data: FieldSetData<FS>): FlattenedErrors {
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

export function extendErrors(original: FlattenedErrors, additional: FlattenedErrors, prefix: string): FlattenedErrors {
  Object.entries(additional).forEach(([key, value]) => {
    original[`${prefix}.${key}`] = value
  })
  return original
}

export function isFormField(field: FieldBase<any, any> | FieldSetRaw): field is FieldBase<any, any> {
  return field instanceof FieldBase
}

export function isArrayField(field: FieldBase<any, any> | FieldSetRaw): field is ArrayField<any> {
  return field instanceof ArrayField
}

export function isFormFieldSet(field: FieldBase<any, any> | FieldSetRaw): field is FieldSet<any> {
  return field instanceof FieldSet
}

export type InferredFieldType<T> = T extends FieldBase<infer R, any> ? R : never

export type IdTypeFromFieldSet<FS extends FieldSetRaw> = FS extends { id: FieldBase<any, any> }
  ? InferredFieldType<FS['id']>
  : unknown
