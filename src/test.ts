import { singleEndpointFormDefinition } from './apiInterfaces'
import { arrayField, charField, fieldSet, numberField } from './factories'
import { notBlank } from './validators'
import { FieldNames } from './forms'

const testFormDefinition = singleEndpointFormDefinition('/test/', {
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
})

const form = testFormDefinition.new()
form.errors.value.users[0].pictures[0].url

type bar = FieldNames<typeof testFormDefinition>
function foo(name: bar) {
  console.log(name)
}

foo('')
