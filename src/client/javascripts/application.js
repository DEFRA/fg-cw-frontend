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

// Initialise GOV.UK Frontend components
createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)
createAll(Tabs)

// Initialise custom select all checkbox logic after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initSelectAllCheckboxes()
})
