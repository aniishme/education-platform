import { Link } from "react-router-dom";
import "../Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-copy">© 2026 StudyFlow. All rights reserved.</p>

        <nav className="footer-links" aria-label="Footer navigation">
          <Link className="footer-link" to="/about">About</Link>
          <Link className="footer-link" to="/contact">Contact</Link>
          <Link className="footer-link" to="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
