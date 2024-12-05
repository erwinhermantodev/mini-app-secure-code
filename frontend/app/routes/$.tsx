export const loader = () => {
  return new Response("Not Found", { status: 404 });
};

export default function NotFound() {
  return <h1>404 - Not Found</h1>;
}
