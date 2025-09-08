import {
  Button,
  Checkboxes,
  createAll,
  ErrorSummary,
  Header,
  Radios,
  SkipLink,
  Tabs,
} from "govuk-frontend";

import { CopyToClipboard } from "../../common/components/copy-to-clipboard/copy-to-clipboard.js";
import { ExpandableText } from "../../common/components/expandable-text/expandable-text.js";

createAll(Button);
createAll(Checkboxes);
createAll(ErrorSummary);
createAll(Header);
createAll(Radios);
createAll(SkipLink);
createAll(Tabs);

createAll(ExpandableText);
createAll(CopyToClipboard);
