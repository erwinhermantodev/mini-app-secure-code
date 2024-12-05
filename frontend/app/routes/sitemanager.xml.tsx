import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  return new Response(
    `<root>
      <manager>Site Manager Configuration</manager>
    </root>`,
    {
      headers: {
        "Content-Type": "application/xml",
      },
    }
  );
};
