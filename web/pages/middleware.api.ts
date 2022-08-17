import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const middleware = (req: NextRequest) => {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host');

  if (!hostname) {
    return new Response(null, {
      status: 400,
      statusText: 'Bad Request'
    });
  }

  console.log(pathname);
  if (pathname.startsWith('/app')) {
    return new Response(null, {
      status: 404
    });
  }

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  url.pathname = `/app/${hostname}${pathname}`;
  return NextResponse.rewrite(url);
};
