import "../Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-copy">© 2026 StudyFlow. All rights reserved.</p>

        <nav className="footer-links" aria-label="Footer navigation">
          <a className="footer-link" href="/about">About</a>
          <a className="footer-link" href="/contact">Contact</a>
          <a className="footer-link" href="/privacy">Privacy</a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
