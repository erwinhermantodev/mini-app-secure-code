import { ActionFunction, json } from "@remix-run/node";
import { Form } from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  // Validate the email and perform your reset password logic here
  if (!email || typeof email !== "string") {
    return json({ error: "Invalid email" }, { status: 400 });
  }

  // Simulate a reset password operation (e.g., send an email)
  console.log(`Reset password link sent to: ${email}`);

  return json({ success: true, message: "Password reset link has been sent!" });
};

export default function ForgotPassword() {
  return (
    <div>
      <h1>Forgot Password</h1>
      <Form method="post">
        <label>
          Email:
          <input type="email" name="email" required />
        </label>
        <button type="submit">Reset Password</button>
      </Form>
    </div>
  );
}
