// Feature switches for things Auri does not ship yet.
//
// Sharing (notes, folders, templates, automations, "shared with me") needs a
// hosted sharing service and accounts, which Auri does not have. Notes leave
// the app through Export instead. The code behind it is kept; flipping this to
// true shows every sharing entry point again.
export const SHARING_ENABLED = false;
