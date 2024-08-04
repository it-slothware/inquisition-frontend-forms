import { crudApiFormDefinition, singleEndpointFormDefinition } from './apiInterfaces'
import { arrayField, charField, fieldSet, numberField } from './factories'
import { notBlank } from './validators'
import { FieldNames, FieldNamesFromFieldSetRaw, FormDefinition } from './forms'
import { CreateArrayOfLength } from './types'
import { FieldSetRaw } from './fields'

const faszom = {
  id: numberField(42),
  name: charField('foo', [notBlank]),
  images: arrayField(charField([notBlank])),
  users: arrayField(
    fieldSet({
      name: charField(),
      pictures: arrayField({
        url: charField(),
      }),
      permissions: arrayField(charField()),
    }),
  ),
  address: {
    city: charField(),
    images: arrayField({
      url: charField(),
    }),
    inner: fieldSet({ photos: arrayField(charField()) }),
    documents: arrayField(charField()),
  },
}

const testFormDefinition = crudApiFormDefinition('/test/', faszom)

const form = testFormDefinition.new()

type kkkadsfk = typeof faszom
type koo = FieldNamesFromFieldSetRaw<typeof faszom, CreateArrayOfLength<15>>
type bar = FieldNames<typeof testFormDefinition>
function foo(name: bar) {
  console.log(name)
}
// form.errors.value.users[0].pictures[0].url

foo('id')
foo('name')
foo('users.0.pictures.0.url')
