import { FieldSet, FieldSetData, FieldSetRaw } from './fields'
import { Form } from './forms'
import { ModelListDefinition } from './apiInterfaces/list'

type LengthOfArray<T extends readonly unknown[]> = T['length']

type Concat<T extends unknown[], U extends unknown[]> = U extends [any, ...infer L] ? Concat<[...T, U[0]], L> : T

export type CreateArrayOfLength<T extends number, A extends unknown[] = []> = A['length'] extends T
  ? A
  : CreateArrayOfLength<T, [...A, 0]>

export type Add<T extends number, U extends number = 1> = LengthOfArray<
  Concat<CreateArrayOfLength<T>, CreateArrayOfLength<U>>
>

export type FieldSetDataFrom<T> = T extends FieldSetRaw
  ? FieldSetData<T>
  : T extends FieldSet<infer R, any>
    ? FieldSetData<R>
    : T extends Form<infer R>
      ? FieldSetData<R>
      : T extends ModelListDefinition<infer R, any, any, any>
        ? FieldSetData<R>
        : never
