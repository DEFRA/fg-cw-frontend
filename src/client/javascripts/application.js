import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink,
  Tabs
} from 'govuk-frontend'

import { initSelectAllCheckboxes } from './modules/checkbox-select-all.js'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)
createAll(Tabs)

document.addEventListener('DOMContentLoaded', () => {
  initSelectAllCheckboxes()
})
