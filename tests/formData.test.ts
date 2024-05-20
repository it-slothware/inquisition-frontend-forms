import { FormDefinition, booleanField, charField, numberField, dateTimeField, arrayField } from '../src'

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
      listOfNulls: arrayField(numberField(null, true), 3),
      listOfObjectWithNulls: arrayField({ id: numberField(null, true) }, 2),
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
      listOfNulls: [null, null, null],
      listOfObjectWithNulls: [{ id: null }, { id: null }],
    })
  })
})

describe('Form push related', () => {
  describe('Array of values', () => {
    const formDefinition = new FormDefinition({
      outer: arrayField(numberField()),
    })
    let form: ReturnType<typeof formDefinition.new>

    beforeEach(() => {
      form = formDefinition.new()
    })

    test('Default value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer')
      expect(form.data.value.outer).toStrictEqual([0])
    })

    test('Custom value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer', 42)
      expect(form.data.value.outer).toStrictEqual([42])
    })
  })

  describe('Array of array of values', () => {
    const formDefinition = new FormDefinition({
      outer: arrayField(arrayField(numberField())),
    })
    let form: ReturnType<typeof formDefinition.new>

    beforeEach(() => {
      form = formDefinition.new()
    })

    test('Default value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer')
      expect(form.data.value.outer).toStrictEqual([[]])
      form.pushRelated('outer.0', 0)
      expect(form.data.value.outer).toStrictEqual([[0]])
    })

    test('Custom value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer', [12, 34])
      expect(form.data.value.outer).toStrictEqual([[12, 34]])
      form.pushRelated('outer.0', 0, 4)
      expect(form.data.value.outer).toStrictEqual([[12, 34, 4]])
    })
  })

  describe('Array of array of array of values', () => {
    const formDefinition = new FormDefinition({
      outer: arrayField(arrayField(arrayField(numberField()))),
    })
    let form: ReturnType<typeof formDefinition.new>

    beforeEach(() => {
      form = formDefinition.new()
    })

    test('Default value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer')
      expect(form.data.value.outer).toStrictEqual([[]])
      form.pushRelated('outer.0', 0)
      expect(form.data.value.outer).toStrictEqual([[[]]])
      form.pushRelated('outer.0.0', 0, 0)
      expect(form.data.value.outer).toStrictEqual([[[0]]])
    })

    test('Custom value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer', [[55]])
      form.pushRelated('outer.0', 0, [12])
      form.pushRelated('outer.0.0', 0, 1, 3)
      expect(form.data.value.outer).toStrictEqual([[[55], [12, 3]]])
    })
  })

  describe('Array of objects', () => {
    const formDefinition = new FormDefinition({
      outer: arrayField({ id: numberField() }),
    })
    let form: ReturnType<typeof formDefinition.new>

    beforeEach(() => {
      form = formDefinition.new()
    })

    test('Default value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer')
      expect(form.data.value.outer).toStrictEqual([{ id: 0 }])
    })

    test('Custom value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer', { id: 12 })
      expect(form.data.value.outer).toStrictEqual([{ id: 12 }])
    })
  })

  describe('Array of objects with array key', () => {
    const formDefinition = new FormDefinition({
      outer: arrayField({ urls: arrayField(charField()) }),
    })
    let form: ReturnType<typeof formDefinition.new>

    beforeEach(() => {
      form = formDefinition.new()
    })

    test('Default value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer')
      expect(form.data.value.outer).toStrictEqual([{ urls: [] }])
      form.pushRelated('outer.0.urls', 0)
      expect(form.data.value.outer).toStrictEqual([{ urls: [''] }])
    })

    test('Custom value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer', { urls: [] })
      expect(form.data.value.outer).toStrictEqual([{ urls: [] }])
      form.pushRelated('outer.0.urls', 0, 'this is an url')
      expect(form.data.value.outer).toStrictEqual([{ urls: ['this is an url'] }])
    })
  })

  describe('Array of objects with array of array of values', () => {
    const formDefinition = new FormDefinition({
      outer: arrayField({ iDontKnow: arrayField(arrayField(numberField())) }),
    })
    let form: ReturnType<typeof formDefinition.new>

    beforeEach(() => {
      form = formDefinition.new()
    })

    test('Default value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer')
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: [] }])
      form.pushRelated('outer.0.iDontKnow', 0)
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: [[]] }])
      form.pushRelated('outer.0.iDontKnow.0', 0, 0)
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: [[0]] }])
    })

    test('Custom value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer', { iDontKnow: [] })
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: [] }])
      form.pushRelated('outer.0.iDontKnow', 0, [12])
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: [[12]] }])
      form.pushRelated('outer.0.iDontKnow.0', 0, 0, 55)
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: [[12, 55]] }])
    })
  })

  describe('Really nested data. Has no idea how to name it', () => {
    const formDefinition = new FormDefinition({
      outer: arrayField({
        iDontKnow: { middle: arrayField(arrayField({ deepInner: arrayField(arrayField(numberField())) })) },
      }),
    })
    let form: ReturnType<typeof formDefinition.new>

    beforeEach(() => {
      form = formDefinition.new()
    })

    test('Default value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer')
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: { middle: [] } }])
      form.pushRelated('outer.0.iDontKnow.middle', 0)
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: { middle: [[]] } }])
      form.pushRelated('outer.0.iDontKnow.middle.0', 0, 0)
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: { middle: [[{ deepInner: [] }]] } }])
      form.pushRelated('outer.0.iDontKnow.middle.0.0.deepInner', 0, 0, 0)
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: { middle: [[{ deepInner: [[]] }]] } }])
      form.pushRelated('outer.0.iDontKnow.middle.0.0.deepInner.0', 0, 0, 0, 0)
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: { middle: [[{ deepInner: [[0]] }]] } }])
    })

    test('Custom value', () => {
      expect(form.data.value.outer).toStrictEqual([])
      form.pushRelated('outer', { iDontKnow: { middle: [] } })
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: { middle: [] } }])
      form.pushRelated('outer.0.iDontKnow.middle', 0, [{ deepInner: [] }])
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: { middle: [[{ deepInner: [] }]] } }])
      form.pushRelated('outer.0.iDontKnow.middle.0', 0, 0, { deepInner: [] })
      expect(form.data.value.outer).toStrictEqual([{ iDontKnow: { middle: [[{ deepInner: [] }, { deepInner: [] }]] } }])
      form.pushRelated('outer.0.iDontKnow.middle.0.0.deepInner', 0, 0, 0, [12])
      expect(form.data.value.outer).toStrictEqual([
        { iDontKnow: { middle: [[{ deepInner: [[12]] }, { deepInner: [] }]] } },
      ])
      form.pushRelated('outer.0.iDontKnow.middle.0.0.deepInner.0', 0, 0, 0, 0, 33)
      expect(form.data.value.outer).toStrictEqual([
        { iDontKnow: { middle: [[{ deepInner: [[12, 33]] }, { deepInner: [] }]] } },
      ])
    })
  })
})
