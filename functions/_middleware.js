// 301: old kobleverk.pages.dev (production host) -> https://kobleverk.no
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === "kobleverk.pages.dev" || url.hostname === "www.kobleverk.no") {
    url.hostname = "kobleverk.no";
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
