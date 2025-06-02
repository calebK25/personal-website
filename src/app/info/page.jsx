"use client";
import { useRef } from "react";

import ReactLenis from "@studio-freight/react-lenis";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";

gsap.registerPlugin(useGSAP);

const Info = () => {
  const container = useRef();

  useGSAP(
    () => {
      const text = new SplitType(".info p", {
        types: "lines",
        tagName: "div",
        lineClass: "line",
      });

      text.lines.forEach((line) => {
        const content = line.innerHTML;
        line.innerHTML = `<span>${content}</span>`;
      });

      gsap.set(".info p .line span", {
        y: 400,
        display: "block",
      });

      gsap.to(".info p .line span", {
        y: 0,
        duration: 2,
        stagger: 0.075,
        ease: "power4.out",
        delay: 0.25,
      });

      return () => {
        if (text) text.revert();
      };
    },
    { scope: container }
  );

  return (
    <ReactLenis root>
      <div className="info" ref={container}>
        <div className="col">
          <img src="/portrait.jpeg" alt="" />
        </div>
        <div className="col">
          <p>
            Kaelon is a portrait photographer who captures striking and artistic
            images. His work focuses on light, shadow, and movement, creating
            portraits that feel both modern and timeless. With a minimal and
            moody style, he brings out raw emotion and unique beauty in every
            subject.
          </p>
        </div>
      </div>
    </ReactLenis>
  );
};

export default Info;
