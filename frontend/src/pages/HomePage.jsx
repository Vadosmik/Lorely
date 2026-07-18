
export default function Home({ user, onLogout }) {

  return (
    <section>
      <h1>Home Page</h1>
      <p>Hello Lorely!</p><br/>
      {user ? (
        <button onClick={onLogout} style={{ ...styles.link, ...styles.button }}>{('logout')}</button>
      ) : (
        <a href="/login" style={{ ...styles.link, ...styles.button }}>{('login')}</a>
      )}
    </section>
  );
}

const styles = {
  hr: {
    borderColor: '#333',
    marginBottom: '20px',
  }
};