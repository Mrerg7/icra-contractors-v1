export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.replace(/^www\./, '');
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
