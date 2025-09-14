"use client";

import { useEffect, useRef, useState } from "react";

const ExperienceTimeline = ({ isExiting = false }) => {
  const listRef = useRef(null);

  const formatDate = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}.${dd}.${yy}`;
  };
  const todayStr = formatDate(new Date());

  const experiences = [
    {
      company: "Princeton IPA Lab",
      position: "AI Researcher",
      duration: "12.03.24 - Present",
      location: "Princeton, NJ",
      description: "Investigating hallucinations in large language models and video language models."
    },
    {
      company: "Remora Capital",
      position: "Quantitative Developer", 
      duration: "05.01.25 - 09.09.25",
      location: "Remote",
      description: "Working on quant firm startup."
    },
    {
      company: "MyChance",
      position: "Founding Engineer", 
      duration: "05.12.25 - Present",
      location: "Remote",
      description: "Building centralized AI college counselor."
    },
    {
      company: "Princeton Vision and Learning Lab", 
      position: "ML/CV Researcher",
      duration: "09.05.25 - Present",
      location: "Princeton, NJ",
      description: "Research advised by Erich Liang."
    }
    ,
    {
      company: "COS226 UCA",
      position: "Undergraduate Course Assistant",
      duration: "09.07.25 - Present",
      location: "Princeton, NJ",
      description: "Data structures and algorithm grader."
    }
  ];

  // No animations; keep layout static
  useEffect(() => {}, []);

  const orderedExperiences = [...experiences].reverse();

  const [typed, setTyped] = useState("");
  useEffect(() => {
    const phrase = "More soon..."; // type three individual dots
    let i = 0;
    let direction = 1; // 1 typing, -1 deleting
    let hold = 0;
    const tick = () => {
      if (direction === 1) {
        if (i <= phrase.length) {
          setTyped(phrase.slice(0, i));
          i += 1;
        } else {
          hold += 1;
          if (hold > 6) { // shorter hold
            direction = -1;
            hold = 0;
          }
        }
      } else {
        if (i > 0) {
          i -= 1;
          setTyped(phrase.slice(0, i));
        } else {
          direction = 1;
        }
      }
    };
    const id = setInterval(tick, 95); // slightly faster typing
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    // Prevent initial flash
    listRef.current.classList.remove('exp-visible');
    // wait a tick so title/description elsewhere can finish
    const start = setTimeout(() => {
      const rows = Array.from(listRef.current.querySelectorAll('.exp-item'));
      rows.forEach((row, idx) => {
        row.classList.add('exp-pre');
        setTimeout(() => row.classList.add('exp-row-in'), 90 * idx);
      });
      // fade in container after rows are scheduled
      listRef.current.classList.add('exp-visible');
    }, 400);
    return () => clearTimeout(start);
  }, []);

  return (
    <div className={`experience-list small ${isExiting ? 'timeline-exit' : ''} paper`} ref={listRef}>
      <div className="receipt-overlay">
        <div className="corner-logo"></div>
        <div className="serial-code">EXP-02</div>
        <div className="crop crop-tl"></div>
        <div className="crop crop-tr"></div>
        <div className="crop crop-bl"></div>
        <div className="crop crop-br"></div>
        <div className="watermark">{new Date().toISOString().slice(0,10)}-EXP</div>
      </div>
      <div className="kv-row with-leaders" style={{ marginBottom: '8px' }}>
        <span className="kv-key">Section</span>
        <span className="kv-value">Experience</span>
      </div>
      <ul className="exp-items">
        <li className="exp-item more">
          <div className="exp-date">{todayStr}</div>
          <div className="exp-body">
            <div className="exp-title"><span>{typed}</span><span className="caret"></span></div>
          </div>
        </li>
        {orderedExperiences.map((exp, index) => (
          <li key={index} className="exp-item">
            <div className="exp-date">{exp.duration || '—'}</div>
            <div className="exp-body">
              <div className="exp-title">{exp.company}</div>
              <div className="exp-sub">{exp.position} · {exp.location}</div>
              <div className="exp-desc">{exp.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExperienceTimeline; 