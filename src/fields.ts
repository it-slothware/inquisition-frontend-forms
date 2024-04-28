import { type FormFieldValidator } from './validators'
import { isFieldLabel, isBoolean, isValidationFunctionArray } from './utils'

type ConditionalNullable<T, P extends boolean> = P extends true ? T | null : T
type FieldDefault<T, P extends boolean> = ConditionalNullable<T, P> | (() => ConditionalNullable<T, P>)

class ErrorList extends Array<string> {}

class FieldBase<DV, P extends boolean = false> {
  readonly label: string
  readonly #defaultValue: FieldDefault<DV, P>
  readonly nullable: boolean
  readonly validators: FormFieldValidator[]

  constructor(label: string, defaultValue: FieldDefault<DV, P>, nullable?: P, validators?: FormFieldValidator[]) {
    this.label = label
    this.#defaultValue = defaultValue
    this.nullable = !!nullable
    this.validators = validators || []
  }

  getDefault(): ConditionalNullable<DV, P> {
    if (this.#defaultValue instanceof Function) return this.#defaultValue()
    return this.#defaultValue
  }

  toNative(rawValue: any): ConditionalNullable<DV, P> {
    return rawValue as ConditionalNullable<DV, P>
  }

  fromNative(value: ConditionalNullable<DV, P>): any {
    return value
  }

  validate(value: ConditionalNullable<DV, P>): ErrorList {
    const errors = new ErrorList()

    this.validators.forEach((validatorFunction) => {
      const result = validatorFunction(value)
      if (result === undefined || result === null) return
      if (Array.isArray(result)) errors.push(...result)
      else errors.push(result)
    })

    return errors
  }
}

class BooleanField<P extends boolean = false> extends FieldBase<boolean, P> {
  constructor(label: string, defaultValue: FieldDefault<boolean, P>, nullable?: P, validators?: FormFieldValidator[]) {
    super(label, defaultValue, nullable, validators)
  }

  toNative(rawValue: any): ConditionalNullable<boolean, P> {
    if (this.nullable && rawValue === null) return null
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
}

class CharField<P extends boolean = false> extends FieldBase<string, P> {
  constructor(label: string, defaultValue: FieldDefault<string, P>, nullable?: P, validators?: FormFieldValidator[]) {
    super(label, defaultValue, nullable, validators)
  }

  toNative(rawValue: any): ConditionalNullable<string, P> {
    if (this.nullable && rawValue === null) return null
    if (typeof rawValue === 'object') {
      if (Array.isArray(rawValue)) return `[${String(rawValue)}]`
    }
    return String(rawValue)
  }
}

class NumberField<P extends boolean = false> extends FieldBase<number, P> {
  constructor(label: string, defaultValue: FieldDefault<number, P>, nullable?: P, validators?: FormFieldValidator[]) {
    super(label, defaultValue, nullable, validators)
  }

  toNative(rawValue: any): ConditionalNullable<number, P> {
    if (this.nullable && rawValue === null) return null

    if (typeof rawValue === 'string') {
      rawValue = rawValue.replace(/(\d)\s+(\d)/g, '$1$2').trim()
      if (rawValue !== '') rawValue = Number(rawValue)
    }
    if (typeof rawValue === 'number' && !isNaN(rawValue)) return rawValue
    console.warn(`Invalid data type: expected number, got ${typeof rawValue}`)
    return 0
  }
}

class DateTimeField<P extends boolean = false> extends FieldBase<Date, P> {
  constructor(label: string, defaultValue: FieldDefault<Date, P>, nullable?: P, validators?: FormFieldValidator[]) {
    super(label, defaultValue, nullable, validators)
  }

  toNative(rawValue: any): ConditionalNullable<Date, P> {
    if (this.nullable && rawValue === null) return null

    if (typeof rawValue === 'string' && isNaN(Number(rawValue))) {
      const convertedDate = new Date(rawValue)
      if (!isNaN(convertedDate.getTime())) return convertedDate
    }

    console.warn(`Invalid data type: cannot convert ${typeof rawValue} to Date`)
    return new Date()
  }

  fromNative(value: ConditionalNullable<Date, P>): any {
    if (value === null) return value
    return value.toISOString()
  }
}

// TODO datetime field
// TODO date field
// TODO array field
// TODO fieldset field

type FactoryFirstParameter<T, P extends boolean> = string | FieldDefault<T, P> | FormFieldValidator[]
type FactorySecondParameter<T, P extends boolean> = FieldDefault<T, P> | P | FormFieldValidator[]
type FactoryThirdArgument<T, P extends boolean> = P | FormFieldValidator[]
type FactoryFourthArgument<T, P extends boolean> = FormFieldValidator[]

// ----------------------------
//         BooleanField
// ----------------------------

function isDefaultBooleanValue(value: any): value is FieldDefault<boolean, true> {
  return typeof value === 'boolean' || typeof value === 'function' || value === null
}

export function booleanField(): BooleanField
export function booleanField(label: string): BooleanField
export function booleanField(defaultValue: FieldDefault<boolean, false>): BooleanField
export function booleanField(validators: FormFieldValidator[]): BooleanField
export function booleanField(label: string, validators: FormFieldValidator[]): BooleanField
export function booleanField<P extends boolean>(defaultValue: FieldDefault<boolean, P>, nullable: P): BooleanField<P>
export function booleanField(label: string, defaultValue: FieldDefault<boolean, false>): BooleanField
export function booleanField(defaultValue: FieldDefault<boolean, false>, validators: FormFieldValidator[]): BooleanField
export function booleanField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<boolean, P>,
  nullable: P,
): BooleanField<P>
export function booleanField<P extends boolean>(
  defaultValue: FieldDefault<boolean, P>,
  nullable: P,
  validators: FormFieldValidator[],
): BooleanField<P>
export function booleanField(
  label: string,
  defaultValue: FieldDefault<boolean, false>,
  validators: FormFieldValidator[],
): BooleanField
export function booleanField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<boolean, P>,
  nullable: P,
  validators: FormFieldValidator[],
): BooleanField<P>
export function booleanField<P extends boolean = false>(argFirst?, argSecond?, argThird?, argFourth?): BooleanField {
  let label: string = ''
  let defaultValue: FieldDefault<boolean, P> = false
  let nullable: P = false as P
  let validators: FormFieldValidator[] = []

  if (isFieldLabel(argFirst)) {
    label = argFirst
    if (isDefaultBooleanValue(argSecond)) {
      defaultValue = argSecond

      if (isBoolean(argThird)) {
        nullable = argThird as P

        if (isValidationFunctionArray(argFourth)) {
          validators = argFourth
        }
      } else if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (isDefaultBooleanValue(argFirst)) {
    defaultValue = argFirst

    if (isBoolean(argSecond)) {
      nullable = argSecond as P

      if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (Array.isArray(argFirst)) {
    validators = argFirst
  }

  return new BooleanField(label, defaultValue, nullable, validators)
}

// -------------------------
//         CharField
// -------------------------

function isDefaultCharValue(value: any): value is FieldDefault<string, true> {
  return typeof value === 'string' || typeof value === 'function' || value === null
}

export function charField(): CharField
export function charField(defaultValue: FieldDefault<string, false>): CharField
export function charField<P extends boolean>(nullable: P): CharField<P>
export function charField(validators: FormFieldValidator[]): CharField
export function charField<P extends boolean>(defaultValue: FieldDefault<string, P>, nullable: P): CharField<P>
export function charField(defaultValue: FieldDefault<string, false>, validators: FormFieldValidator[]): CharField
export function charField(label: string, defaultValue: FieldDefault<string, false>): CharField
export function charField<P extends boolean>(nullable: P, validators: FormFieldValidator[]): CharField<P>
export function charField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<string, P>,
  nullable: P,
): CharField<P>
export function charField(
  label: string,
  defaultValue: FieldDefault<string, false>,
  validators: FormFieldValidator[],
): CharField
export function charField<P extends boolean>(
  defaultValue: FieldDefault<string, P>,
  nullable: P,
  validators: FormFieldValidator[],
): CharField<P>
export function charField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<string, P>,
  nullable: P,
  validators: FormFieldValidator[],
): CharField<P>
export function charField<P extends boolean = false>(argFirst?, argSecond?, argThird?, argFourth?): CharField<P> {
  let label: string = ''
  let defaultValue: FieldDefault<string, P> = ''
  let nullable: P = false as P
  let validators: FormFieldValidator[] = []

  if (isDefaultCharValue(argFirst)) {
    if (isFieldLabel(argFirst) && isDefaultCharValue(argSecond)) {
      label = argFirst
      defaultValue = argSecond

      if (isBoolean(argThird)) {
        nullable = argThird as P

        if (isValidationFunctionArray(argFourth)) {
          validators = argFourth
        }
      } else if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else {
      defaultValue = argFirst
    }

    if (isBoolean(argSecond)) {
      defaultValue = argFirst
      nullable = argSecond as P

      if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (isBoolean(argFirst)) {
    nullable = argFirst as P

    if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (Array.isArray(argFirst)) {
    validators = argFirst
  }

  return new CharField(label, defaultValue, nullable, validators)
}

// ---------------------------
//         NumberField
// ---------------------------

function isDefaultNumberValue(value: any): value is FieldDefault<number, true> {
  return (typeof value === 'number' && !isNaN(value)) || typeof value === 'function' || value === null
}

export function numberField(): NumberField
export function numberField(label: string): NumberField
export function numberField(defaultValue: FieldDefault<number, false>): NumberField
export function numberField<P extends boolean>(nullable: P): NumberField<P>
export function numberField(validators: FormFieldValidator[]): NumberField
export function numberField(label: string, defaultValue: FieldDefault<number, false>): NumberField
export function numberField<P extends boolean>(defaultValue: FieldDefault<number, P>, nullable: P): NumberField<P>
export function numberField<P extends boolean>(label: string, nullable: P): NumberField<P>
export function numberField(label: string, validators: FormFieldValidator[]): NumberField
export function numberField(defaultValue: FieldDefault<number, false>, validators: FormFieldValidator[]): NumberField
export function numberField<P extends boolean>(nullable: P, validators: FormFieldValidator[]): NumberField<P>
export function numberField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<number, P>,
  nullable: P,
): NumberField<P>
export function numberField(
  label: string,
  defaultValue: FieldDefault<number, false>,
  validators: FormFieldValidator[],
): NumberField
export function numberField<P extends boolean>(
  defaultValue: FieldDefault<number, P>,
  nullable: P,
  validators: FormFieldValidator[],
): NumberField<P>
export function numberField<P extends boolean>(
  label: string,
  nullable: P,
  validators: FormFieldValidator[],
): NumberField<P>
export function numberField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<number, P>,
  nullable: P,
  validators: FormFieldValidator[],
): NumberField<P>
export function numberField<P extends boolean = false>(argFirst?, argSecond?, argThird?, argFourth?): NumberField<P> {
  let label: string = ''
  let defaultValue: FieldDefault<number, P> = 0
  let nullable: P = false as P
  let validators: FormFieldValidator[] = []

  if (isFieldLabel(argFirst)) {
    label = argFirst

    if (isDefaultNumberValue(argSecond)) {
      defaultValue = argSecond

      if (isBoolean(argThird)) {
        nullable = argThird as P

        if (isValidationFunctionArray(argFourth)) {
          validators = argFourth
        }
      } else if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (isBoolean(argSecond)) {
      nullable = argSecond as P

      if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (isDefaultNumberValue(argFirst)) {
    defaultValue = argFirst

    if (isBoolean(argSecond)) {
      nullable = argSecond as P

      if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (isBoolean(argFirst)) {
    nullable = argFirst as P

    if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (isValidationFunctionArray(argFirst)) {
    validators = argFirst
  }

  return new NumberField(label, defaultValue, nullable, validators)
}

// -----------------------------
//         DateTimeField
// -----------------------------

function isDefaultDateValue(value: any): value is FieldDefault<Date, true> {
  return value instanceof Date || value === null || typeof value === 'function'
}

export function dateTimeField(): DateTimeField
export function dateTimeField(label: string): DateTimeField
export function dateTimeField(defaultValue: FieldDefault<Date, false>): DateTimeField
export function dateTimeField<P extends boolean>(nullable: P): DateTimeField<P>
export function dateTimeField(validators: FormFieldValidator[]): DateTimeField
export function dateTimeField(label: string, defaultValue: FieldDefault<Date, false>): DateTimeField
export function dateTimeField<P extends boolean>(defaultValue: FieldDefault<Date, P>, nullable: P): DateTimeField<P>
export function dateTimeField<P extends boolean>(label: string, nullable: P): DateTimeField<P>
export function dateTimeField(label: string, validators: FormFieldValidator[]): DateTimeField
export function dateTimeField(defaultValue: FieldDefault<Date, false>, validators: FormFieldValidator[]): DateTimeField
export function dateTimeField<P extends boolean>(nullable: P, validators: FormFieldValidator[]): DateTimeField<P>
export function dateTimeField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<Date, P>,
  nullable: P,
): DateTimeField<P>
export function dateTimeField(
  label: string,
  defaultValue: FieldDefault<Date, false>,
  validators: FormFieldValidator[],
): DateTimeField
export function dateTimeField<P extends boolean>(
  defaultValue: FieldDefault<Date, P>,
  nullable: P,
  validators: FormFieldValidator[],
): DateTimeField<P>
export function dateTimeField<P extends boolean>(
  label: string,
  nullable: P,
  validators: FormFieldValidator[],
): DateTimeField<P>
export function dateTimeField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<Date, P>,
  nullable: P,
  validators: FormFieldValidator[],
): DateTimeField<P>
export function dateTimeField<P extends boolean = false>(
  argFirst?,
  argSecond?,
  argThird?,
  argFourth?,
): DateTimeField<P> {
  let label: string = ''
  let defaultValue: FieldDefault<Date, P> = new Date()
  let nullable: P = false as P
  let validators: FormFieldValidator[] = []

  if (isFieldLabel(argFirst)) {
    label = argFirst

    if (isDefaultDateValue(argSecond)) {
      defaultValue = argSecond

      if (isBoolean(argThird)) {
        nullable = argThird as P

        if (isValidationFunctionArray(argFourth)) {
          validators = argFourth
        }
      } else if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (isBoolean(argSecond)) {
      nullable = argSecond as P

      if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (isDefaultDateValue(argFirst)) {
    defaultValue = argFirst

    if (isBoolean(argSecond)) {
      nullable = argSecond as P

      if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (isBoolean(argFirst)) {
    nullable = argFirst as P

    if (isValidationFunctionArray(argSecond)) {
      validators = argSecond
    }
  } else if (isValidationFunctionArray(argFirst)) {
    validators = argFirst
  }

  return new DateTimeField(label, defaultValue, nullable, validators)
}
