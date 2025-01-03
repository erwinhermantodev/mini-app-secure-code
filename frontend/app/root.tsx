import {
  Links,
  Meta,
  Outlet,
  Scripts,
  LiveReload,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { AuthProvider } from "./context/authContext";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// Handle POST requests to "/"
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const someField = formData.get("someField");

  if (!someField) {
    return json({ error: "Missing someField" }, { status: 400 });
  }

  // Perform your desired operation with `someField`
  console.log("Received data in root action:", someField);

  return json({ success: true, message: "Data received successfully" });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Links />
      </head>
      <body>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <LiveReload />
      </body>
    </html>
  );
}
