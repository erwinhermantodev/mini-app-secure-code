// app/routes/404.tsx
import { json } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";

export const loader = () => json({ error: "Not Found" }, { status: 404 });

export default function NotFound() {
  const error = useRouteError();
  console.error(error); // Log the error for debugging purposes
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for does not exist.</p>
    </div>
  );
}
