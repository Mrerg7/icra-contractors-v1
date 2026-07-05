export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'www.icra.contractors') {
      url.hostname = 'icra.contractors';
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
