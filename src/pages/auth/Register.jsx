function Register() {
  return (
    <div style={{ padding: "100px" }}>
      <h1>Register</h1>

      <input placeholder="Name" />
      <br />

      <input placeholder="Email" />
      <br />

      <input placeholder="Password" type="password" />
      <br />

      <button>Register</button>
    </div>
  );
}

export default Register;