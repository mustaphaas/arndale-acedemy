export const isLocalDemo = true;

export async function signOut() {
  // Demo views have no authenticated session. Returning home keeps homework.
  window.location.assign("/");
}
