import { login } from "../api/auth";

const handleSubmit = async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const response = await login(email, password);
    console.log("Login response:", response);
  } catch (err) {
    console.error(err);
  }
};
