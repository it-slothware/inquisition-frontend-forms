import { ArrayFormField, CharFormField, NumberFormField, DateTimeFormField } from './fields'

export const commentsFormFieldSet = {
  comments: new ArrayFormField('Kommentek', {
    author: {
      id: new NumberFormField('Szerző ID', 0),
      name: new CharFormField('Szerző', ''),
    },
    content: new CharFormField('Komment', ''),
    created_at: new DateTimeFormField('Létrehozva', new Date()),
    id: new NumberFormField('ID', 0),
  }),
}
