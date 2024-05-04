import { FormDefinition, booleanField, charField, numberField, dateTimeField } from '../src'

describe('Form tester', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 4, 5, 18, 44, 23))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('Default data layout', () => {
    const formDefinition = new FormDefinition({
      id: numberField(),
      nullableNumber: numberField(null, true),
      meaningOfLife: numberField(42),
      emptyName: charField(),
      nullableChar: charField(null, true),
      notDefaultStr: charField('Something different'),
      hasPreviousErrors: booleanField(),
      isActive: booleanField(true),
      nullableBoolean: booleanField(null, true),
      createdAt: dateTimeField(new Date(2024, 4, 4, 12, 31, 44)),
      modifiedAt: dateTimeField(),
      deletedAt: dateTimeField(null, true),
    })

    const form = formDefinition.new()
    expect(form.data.value).toStrictEqual({
      id: 0,
      meaningOfLife: 42,
      nullableNumber: null,
      emptyName: '',
      nullableChar: null,
      notDefaultStr: 'Something different',
      hasPreviousErrors: false,
      isActive: true,
      nullableBoolean: null,
      createdAt: new Date(2024, 4, 4, 12, 31, 44),
      modifiedAt: new Date(2024, 4, 5, 18, 44, 23),
      deletedAt: null,
    })
  })
})
