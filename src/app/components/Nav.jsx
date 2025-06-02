"use client";

const Nav = () => {
  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav className="nav">
      <div className="logo">
        <div className="link">
          <a
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            href="/"
          >
            Home
          </a>
        </div>
      </div>
      <div className="links">
        <div className="link">
          <a
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo('about');
            }}
            href="#about"
          >
            About
          </a>
        </div>
        <div className="link">
          <a
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo('projects');
            }}
            href="#projects"
          >
            Projects
          </a>
        </div>
        <div className="link">
          <a
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo('timeline');
            }}
            href="#timeline"
          >
            Experience
          </a>
        </div>
        <div className="link">
          <a
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo('photography');
            }}
            href="#photography"
          >
            Photography
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
