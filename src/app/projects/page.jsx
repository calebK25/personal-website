"use client";

import ReactLenis from "@studio-freight/react-lenis";

const Projects = () => {
  return (
    <ReactLenis root>
      <div className="projects">
        <div className="images">
          <img src="/img1.jpeg" alt="" />
          <img src="/img2.jpeg" alt="" />
          <img src="/img3.jpeg" alt="" />
          <img src="/img4.jpeg" alt="" />
        </div>
      </div>
    </ReactLenis>
  );
};

export default Projects;
