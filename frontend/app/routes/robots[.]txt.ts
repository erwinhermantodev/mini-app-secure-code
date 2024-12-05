// routes/robots[.]txt.ts
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const robotsTxt = `
    User-agent: *
    Allow: /
  `;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
