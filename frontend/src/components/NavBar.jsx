import { Button } from './Button';

export function NavBar({ user, onLogout }) {
  return (
    <nav className="navbar" style={styles.navbar}>
      <div className="nav-brand">
        <a href="/" style={styles.linkBold}>Lorely</a>
      </div>

      <div className="nav-links" style={styles.links}>
        <a href="/" style={styles.link}>Home</a>
        <a href="/catalog" style={styles.link}>Catalog</a>

        {user && (
          <div>
            <a href="/editor" style={styles.link}>Editor</a>
            <a href={`/${user.username}`} style={styles.link}> {user.username} </a>
          </div>
        )}

        {user ? (
          <Button variant="secondary" onClick={onLogout}>log out</Button>
        ) : (
          <a href="/login"><Button variant="primary">log in</Button></a>
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
    fontSize: '16px'
  },
  linkBold: {
    color: '#fff',
    textDecoration: 'none'
  }
};