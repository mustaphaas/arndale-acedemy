import { createAuthPlugin, getAppBasePath } from "@agent-native/core/server";

import { createPortalLoginHtml } from "../lib/portal-login";

// Branding replaces only the sign-in document. Framework sessions, route
// protection, and the existing authenticated home at / remain in place.
export default createAuthPlugin({
  rootAuth: false,
  loginHtml: createPortalLoginHtml({ basePath: getAppBasePath() }),
});
