import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  // Redirect to the login route
  return redirect("/login");
};

export const meta: MetaFunction = () => {
  return [
    { title: "Redirecting to Login" },
    { name: "description", content: "Redirecting to the login page." },
  ];
};

export default function Index() {
  return null; // The component won't render because of the redirect
}
