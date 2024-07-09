type LengthOfArray<T extends readonly unknown[]> = T['length']

type Concat<T extends unknown[], U extends unknown[]> = U extends [any, ...infer L] ? Concat<[...T, U[0]], L> : T

type Pop<T extends unknown[]> = T extends [...infer R, any] ? R : T

type PopN<T extends unknown[], U extends number = 1, V extends any[] = []> = V['length'] extends U
  ? T
  : PopN<Pop<T>, U, [...V, 0]>

export type CreateArrayOfLength<T extends number, A extends unknown[] = []> = A['length'] extends T
  ? A
  : CreateArrayOfLength<T, [...A, 0]>

export type Add<T extends number, U extends number = 1> = LengthOfArray<
  Concat<CreateArrayOfLength<T>, CreateArrayOfLength<U>>
>

export type Subtract<T extends number, U extends number = 1> = LengthOfArray<PopN<CreateArrayOfLength<T>, U>>
