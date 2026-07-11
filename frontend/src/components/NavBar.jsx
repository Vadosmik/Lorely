export function NavBar({ user, onLogout }) {
  return (
    <nav className="navbar" style={styles.navbar}>
      <div className="nav-brand">
        <a href="/" style={styles.brand}>Lorely</a>
      </div>

      <div className="nav-links" style={styles.links}>
        <a href="/" style={styles.link}>Home</a>
        <a href="/catalog" style={styles.link}>Catalog</a>


        {user && (
          <>
            <a href="/studio" style={styles.link}>Studio</a>
            <a href="/admin" style={styles.link}>ADMIN</a>
            <a href={`/${user.username}`} style={styles.link}>{user.username}</a>
          </>
        )}

        {user ? (
          <a onClick={onLogout} style={{ ...styles.link, ...styles.button }}>Log out</a>
        ) : (
          <a href="/login" style={{ ...styles.link, ...styles.button }}>Log in</a>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderBottom: '1px solid #333'
  },
  brand: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '16px',
    cursor: 'pointer'
  },
  button: {
    background: '#000fff',
    padding: '6px 12px',
    borderRadius: '4px',
    color: '#fff'
  }
};