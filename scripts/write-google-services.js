// EAS pre-install hook: writes GoogleService-Info.plist into the build from a
// base64 env var, so the gitignored plist is present before prebuild runs.
// Set GOOGLE_SERVICE_INFO_PLIST_BASE64 in the build environment (CI workflow
// step env, or an EAS environment variable for cloud builds).
const fs = require('fs');

const b64 = process.env.GOOGLE_SERVICE_INFO_PLIST_BASE64;
const target = 'GoogleService-Info.plist';

if (b64) {
  fs.writeFileSync(target, Buffer.from(b64, 'base64'));
  console.log(`[eas-build-pre-install] Wrote ${target} (${fs.statSync(target).size} bytes)`);
} else if (fs.existsSync(target)) {
  console.log(`[eas-build-pre-install] ${target} already present; leaving as is`);
} else {
  console.warn(`[eas-build-pre-install] No GOOGLE_SERVICE_INFO_PLIST_BASE64 and no ${target} found`);
}
