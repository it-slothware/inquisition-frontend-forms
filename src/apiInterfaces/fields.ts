import type { ConditionalNullable } from '../types'
export type InferredFieldType<T> = T extends FieldBase<any, infer R> ? R : never

export type ModelFieldSetRaw = { [key: string]: FieldBase<any, any> | ModelFieldSetRaw }
export type ModelData<T> = {
  [key in keyof T]: T[key] extends FieldBase<any, any> ? ReturnType<T[key]['toNative']> : ModelData<T[key]>
}
export type ModelErrors<T> = Partial<{
  [key in keyof T]: T[key] extends FieldBase<any, any> ? string[] : ModelErrors<T[key]>
}>

export class FieldBase<P extends boolean = false, T = any> {
  nullable: boolean

  constructor(nullable?: P) {
    this.nullable = !!nullable
  }

  toNative(value: any): ConditionalNullable<T, P> {
    return value as ConditionalNullable<T, P>
  }

  fromNative(value: ConditionalNullable<T, P>): any {
    return value
  }
}

export class CharField<P extends boolean = false> extends FieldBase<P, string> {
  fromNative(value: ConditionalNullable<string, P>) {
    if (value === null) return null
    return `${value}`
  }
}

export class NumberField<P extends boolean = false> extends FieldBase<P, number> {
  toNative(value: any) {
    return parseFloat(value) as ConditionalNullable<number, P>
  }
}

export class DecimalField<P extends boolean = false> extends NumberField<P> {
  fromNative(value: ConditionalNullable<number, P>) {
    if (value === null) return value
    return value.toString()
  }
}

export class BooleanField<P extends boolean = false> extends FieldBase<P, boolean> {}

export class DateTimeField<P extends boolean = false> extends FieldBase<P, Date> {
  toNative(value: any) {
    if (this.nullable && value === null) return null as ConditionalNullable<Date, P>
    return new Date(value) as ConditionalNullable<Date, P>
  }

  fromNative(value: ConditionalNullable<Date, P>) {
    if (value === null) return value
    return new Date(value).toISOString()
  }
}

export class DateField<P extends boolean = false> extends DateTimeField<P> {
  fromNative(value: ConditionalNullable<Date, P>) {
    if (value === null) return value
    return new Date(value).toISOString().split('T')[0]
  }
}

// TODO fix these any's
export class ArrayField<
  T extends ModelFieldSetRaw | FieldBase<any>,
  IL extends number = 0,
  P extends boolean = false,
> extends FieldBase<P, ModelData<T>[]> {
  readonly baseField: FieldBase<any>
  readonly initialLength: number

  constructor(baseField: T, initialLength?: number, nullable?: P) {
    if (!initialLength) initialLength = 0
    super(nullable)

    if (!isModelField(baseField)) {
      this.baseField = new ModelFieldSet(baseField)
    } else {
      this.baseField = baseField
    }
    this.initialLength = initialLength
  }

  getDefault(): ModelData<T>[] {
    return [] as ModelData<T>[]
  }

  toNative(value: any): ModelData<T>[] {
    return value.map((arrayElement: Record<string, any>) => {
      return this.baseField.toNative(arrayElement)
    })
  }

  fromNative(value: ConditionalNullable<ModelData<T>[], false>): any {
    return value.map((arrayElement) => {
      return this.baseField.fromNative(arrayElement)
    })
  }
}

export class ModelFieldSet<T extends ModelFieldSetRaw, P extends boolean = false> extends FieldBase<P, ModelData<T>> {
  readonly fieldSetRaw: T

  constructor(fieldSetRaw: T, nullable?: P) {
    super(nullable)
    const normalizedFieldSetRaw: Record<string, any> = {}
    for (const [fieldName, field] of Object.entries(fieldSetRaw)) {
      if (isModelField(field)) normalizedFieldSetRaw[fieldName] = field
      else normalizedFieldSetRaw[fieldName] = new ModelFieldSet(field)
    }
    this.fieldSetRaw = normalizedFieldSetRaw as T
  }

  toNative(value: any) {
    if (value === null) {
      if (this.nullable) return value as ConditionalNullable<ModelData<T>, P>
    }

    const nativeData: Record<string, any> = {}
    for (const [fieldName, field] of Object.entries(this.fieldSetRaw)) {
      const rawData: any = value[fieldName]

      if (!isModelField(field)) continue

      if (rawData === undefined) {
        console.warn(`Missing key ${fieldName}`)
      } else {
        nativeData[fieldName] = field.toNative(rawData)
      }
    }

    return nativeData as ConditionalNullable<ModelData<T>, P>
  }

  fromNative(value: ConditionalNullable<ModelData<T>, P>) {
    if (value === null) return null

    const data: Record<string, any> = {}
    for (const [fieldName, field] of Object.entries(this.fieldSetRaw)) {
      if (!isModelField(field)) continue

      data[fieldName] = field.fromNative(value[fieldName])
    }
    return data as ConditionalNullable<ModelData<T>, P>
  }
}

export function isModelField(field: FieldBase<any> | ModelFieldSetRaw): field is FieldBase<any, any> {
  return field instanceof FieldBase
}

export function isArrayField(field: FieldBase<any> | ModelFieldSetRaw): field is ArrayField<any> {
  return field instanceof ArrayField
}

export type IdTypeFromModelFieldSet<FS extends ModelFieldSetRaw> = FS extends { id: FieldBase<any> }
  ? InferredFieldType<FS['id']>
  : never
