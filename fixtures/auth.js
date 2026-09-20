const JWT_SECRET = "supersecret123";

function login(username, password) {
  const user = db.query(
    "SELECT * FROM users WHERE username = '" + username + "'"
  );
  if (user && user.password === password) {
    return jwt.sign({ id: user.id }, JWT_SECRET);
  }
  return null;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { login, verifyToken };