import {
  type ConditionalNullable,
  type FieldDefault,
  type ArrayFieldDefault,
  BooleanField,
  CharField,
  NumberField,
  DateTimeField,
  DateField,
  ArrayField,
  FieldSet,
  FieldSetRaw,
  FieldBase,
  FieldSetData,
  FieldSetDefault,
} from './fields'
import { isFieldLabel, isBoolean, isValidationFunctionArray } from './utils'
import { type FormFieldValidator } from './validators'

// ----------------------------
//         BooleanField
// ----------------------------

function isDefaultBooleanValue<P extends boolean>(value: any): value is FieldDefault<boolean, P> {
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
export function booleanField<P extends boolean = false>(argFirst?, argSecond?, argThird?, argFourth?): BooleanField<P> {
  let label: string = ''
  let defaultValue: FieldDefault<boolean, P> = false
  let nullable: P = false as P
  let validators: FormFieldValidator[] = []

  if (isFieldLabel(argFirst)) {
    label = argFirst
    if (isDefaultBooleanValue<P>(argSecond)) {
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
  } else if (isDefaultBooleanValue<P>(argFirst)) {
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

function isDefaultCharValue<P extends boolean>(value: any): value is FieldDefault<string, P> {
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

  if (isDefaultCharValue<P>(argFirst)) {
    if (isFieldLabel(argFirst) && isDefaultCharValue<P>(argSecond)) {
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

function isDefaultNumberValue<P extends boolean>(value: any): value is FieldDefault<number, P> {
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

    if (isDefaultNumberValue<P>(argSecond)) {
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
  } else if (isDefaultNumberValue<P>(argFirst)) {
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

function isDefaultDateValue<P extends boolean>(value: any): value is FieldDefault<Date, P> {
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

    if (isDefaultDateValue<P>(argSecond)) {
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
  } else if (isDefaultDateValue<P>(argFirst)) {
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

export function dateField(): DateField
export function dateField(label: string): DateField
export function dateField(defaultValue: FieldDefault<Date, false>): DateField
export function dateField<P extends boolean>(nullable: P): DateField<P>
export function dateField(validators: FormFieldValidator[]): DateField
export function dateField(label: string, defaultValue: FieldDefault<Date, false>): DateField
export function dateField<P extends boolean>(defaultValue: FieldDefault<Date, P>, nullable: P): DateField<P>
export function dateField<P extends boolean>(label: string, nullable: P): DateField<P>
export function dateField(label: string, validators: FormFieldValidator[]): DateField
export function dateField(defaultValue: FieldDefault<Date, false>, validators: FormFieldValidator[]): DateField
export function dateField<P extends boolean>(nullable: P, validators: FormFieldValidator[]): DateField<P>
export function dateField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<Date, P>,
  nullable: P,
): DateField<P>
export function dateField(
  label: string,
  defaultValue: FieldDefault<Date, false>,
  validators: FormFieldValidator[],
): DateField
export function dateField<P extends boolean>(
  defaultValue: FieldDefault<Date, P>,
  nullable: P,
  validators: FormFieldValidator[],
): DateField<P>
export function dateField<P extends boolean>(label: string, nullable: P, validators: FormFieldValidator[]): DateField<P>
export function dateField<P extends boolean>(
  label: string,
  defaultValue: FieldDefault<Date, P>,
  nullable: P,
  validators: FormFieldValidator[],
): DateField<P>
export function dateField<P extends boolean = false>(argFirst?, argSecond?, argThird?, argFourth?): DateField<P> {
  let label: string = ''
  let defaultValue: FieldDefault<Date, P> = new Date()
  let nullable: P = false as P
  let validators: FormFieldValidator[] = []

  if (isFieldLabel(argFirst)) {
    label = argFirst

    if (isDefaultDateValue<P>(argSecond)) {
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
  } else if (isDefaultDateValue<P>(argFirst)) {
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

  return new DateField(label, defaultValue, nullable, validators)
}

export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(baseField: T): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  baseField: T,
  defaultValue: () => ConditionalNullable<ArrayFieldDefault<T>[], false>,
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  baseField: T,
  initialLength: number,
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  baseField: T,
  nullable: P,
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  baseField: T,
  validators: FormFieldValidator[],
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(label: string, baseField: T): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  baseField: T,
  defaultValue: () => ConditionalNullable<ArrayFieldDefault<T>[], P>,
  nullable: P,
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  baseField: T,
  defaultValue: () => ConditionalNullable<ArrayFieldDefault<T>[], false>,
  validators: FormFieldValidator[],
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  baseField: T,
  initialLength: number,
  nullable: P,
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  baseField: T,
  initialLength: number,
  validators: FormFieldValidator[],
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  baseField: T,
  nullable: P,
  validators: FormFieldValidator[],
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  label: string,
  baseField: T,
  defaultValue: () => ConditionalNullable<ArrayFieldDefault<T>[], false>,
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  label: string,
  baseField: T,
  initialLength: number,
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  label: string,
  baseField: T,
  nullable: P,
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  label: string,
  baseField: T,
  validators: FormFieldValidator[],
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  baseField: T,
  defaultValue: () => ConditionalNullable<ArrayFieldDefault<T>[], P>,
  nullable: P,
  validators: FormFieldValidator[],
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  baseField: T,
  initialLength: number,
  nullable: P,
  validators: FormFieldValidator[],
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  label: string,
  baseField: T,
  defaultValue: () => ConditionalNullable<ArrayFieldDefault<T>[], P>,
  nullable: P,
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  label: string,
  baseField: T,
  defaultValue: () => ConditionalNullable<ArrayFieldDefault<T>[], false>,
  validators: FormFieldValidator[],
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  label: string,
  baseField: T,
  initialLength: number,
  nullable: P,
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  label: string,
  baseField: T,
  initialLength: number,
  validators: FormFieldValidator[],
): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  label: string,
  baseField: T,
  nullable: P,
  validators: FormFieldValidator[],
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  label: string,
  baseField: T,
  defaultValue: () => ConditionalNullable<ArrayFieldDefault<T>[], P>,
  nullable: P,
  validators: FormFieldValidator[],
): ArrayField<T, P>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>, P extends boolean>(
  label: string,
  baseField: T,
  initialLength: number,
  nullable: P,
  validators: FormFieldValidator[],
): ArrayField<T, P>
export function arrayField<P extends boolean = false>(
  argFirst?,
  argSecond?,
  argThird?,
  argFourth?,
  argFifth?,
): ArrayField<any, P> {
  let label: string = ''
  let baseField: FieldSetRaw | FieldBase<any, any>
  let defaultValue: any = undefined // TODO type this line
  let initialLength: number = 0
  let nullable: P = false as P
  let validators: FormFieldValidator[] = []

  // TODO fix this typeof function stuff. make a dedicated generic type for this

  if (isFieldLabel(argFirst)) {
    label = argFirst
    baseField = argSecond

    if (typeof argThird === 'function') {
      defaultValue = argThird

      if (isBoolean(argFourth)) {
        nullable = argFourth as P

        if (isValidationFunctionArray(argFifth)) {
          validators = argFifth
        }
      } else if (isValidationFunctionArray(argFourth)) {
        validators = argFourth
      }
    } else if (typeof argThird === 'number') {
      initialLength = argThird

      if (isBoolean(argFourth)) {
        nullable = argFourth as P

        if (isValidationFunctionArray(argFifth)) {
          validators = argFifth
        }
      } else if (isValidationFunctionArray(argFourth)) {
        validators = argFourth
      }
    } else if (isBoolean(argThird)) {
      nullable = argThird as P

      if (isValidationFunctionArray(argFourth)) {
        validators = argFourth
      }
    } else if (isValidationFunctionArray(argThird)) {
      validators = argThird
    }
  } else {
    baseField = argFirst

    if (typeof argSecond === 'function') {
      defaultValue = argSecond

      if (isBoolean(argThird)) {
        nullable = argThird as P

        if (isValidationFunctionArray(argFourth)) {
          validators = argFourth
        }
      } else if (isValidationFunctionArray(argThird)) {
        validators = argThird
      }
    } else if (typeof argSecond === 'number') {
      initialLength = argSecond

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
  }

  return new ArrayField(label, baseField, defaultValue, initialLength, nullable, validators)
}

// ------------------------
//         FieldSet
// ------------------------
function isDefaultFieldSetValue<T extends FieldSetRaw, P extends boolean>(value: any): value is FieldSetDefault<T, P> {
  return value === null || typeof value === 'function'
}

export function fieldSet<T extends FieldSetRaw>(rawFieldSet: T): FieldSet<T>
export function fieldSet<T extends FieldSetRaw>(label: string, rawFieldSet: T): FieldSet<T>
export function fieldSet<T extends FieldSetRaw, D extends FieldSetDefault<T>>(
  rawFieldSet: T,
  defaultValue: D,
): FieldSet<T>
export function fieldSet<T extends FieldSetRaw, P extends boolean>(rawFieldSet: T, nullable: P): FieldSet<T, P>
export function fieldSet<T extends FieldSetRaw>(rawFieldSet: T, validators: FormFieldValidator[]): FieldSet<T>
export function fieldSet<T extends FieldSetRaw, D extends FieldSetDefault<T, P>, P extends boolean>(
  rawFieldSet: T,
  defaultValue: D,
  nullable: P,
): FieldSet<T, P>
export function fieldSet<T extends FieldSetRaw, D extends FieldSetDefault<T>>(
  rawFieldSet: T,
  defaultValue: D,
  validators: FormFieldValidator[],
): FieldSet<T>
export function fieldSet<T extends FieldSetRaw, D extends FieldSetDefault<T>>(
  label: string,
  rawFieldSet: T,
  defaultValue: D,
): FieldSet<T>
export function fieldSet<T extends FieldSetRaw, P extends boolean>(
  label: string,
  rawFieldSet: T,
  nullable: P,
): FieldSet<T, P>
export function fieldSet<T extends FieldSetRaw, D extends FieldSetDefault<T, P>, P extends boolean>(
  rawFieldSet: T,
  defaultValue: D,
  nullable: P,
  validators: FormFieldValidator[],
): FieldSet<T, P>
export function fieldSet<T extends FieldSetRaw, D extends FieldSetDefault<T, P>, P extends boolean>(
  label: string,
  rawFieldSet: T,
  defaultValue: D,
  nullable: P,
): FieldSet<T, P>
export function fieldSet<T extends FieldSetRaw, D extends FieldSetDefault<T, P>, P extends boolean>(
  label: string,
  rawFieldSet: T,
  defaultValue: D,
  nullable: P,
  validators: FormFieldValidator[],
): FieldSet<T, P>
export function fieldSet<T extends FieldSetRaw, P extends boolean = false>(
  argFirst,
  argSecond?,
  argThird?,
  argFourth?,
  argFifth?,
): FieldSet<any, P> {
  let label: string = ''
  let rawFieldSet: FieldSetRaw
  let defaultValue: FieldSetDefault<T, P> | undefined = undefined
  let nullable: P = false as P
  let validators: FormFieldValidator[] = []

  if (isFieldLabel(argFirst)) {
    label = argFirst
    rawFieldSet = argSecond

    if (isDefaultFieldSetValue<T, P>(argThird)) {
      defaultValue = argThird

      if (isBoolean(argFourth)) {
        nullable = argFourth as P

        if (isValidationFunctionArray(argFifth)) {
          validators = argFifth
        }
      }
    } else if (isBoolean(argThird)) {
      nullable = argThird as P

      if (isValidationFunctionArray(argFourth)) {
        validators = argFourth
      }
    } else if (isValidationFunctionArray(argThird)) {
      validators = argThird
    }
  } else {
    rawFieldSet = argFirst

    if (isDefaultFieldSetValue<T, P>(argSecond)) {
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
  }

  return new FieldSet(rawFieldSet, label, defaultValue, nullable, validators)
}
