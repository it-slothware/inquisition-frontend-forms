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
} from './fields'
import { isFieldLabel, isBoolean, isValidationFunctionArray } from './utils'
import { type FormFieldValidator } from './validators'

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

  return new DateField(label, defaultValue, nullable, validators)
}

export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(baseField: T): ArrayField<T>
export function arrayField<T extends FieldSetRaw | FieldBase<any, any>>(
  baseField: T,
  defaultValue: FieldDefault<() => ConditionalNullable<ArrayFieldDefault<T>[], false>, false>,
): ArrayField<T>
export function arrayField<P extends boolean = false>(
  argFirst?,
  argSecond?,
  argThird?,
  argFourth?,
  argFifth?,
  argSixts?,
): ArrayField<any, P> {
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

  return new ArrayField(label, defaultValue, nullable, validators)
}
