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
      duration: "Sep. 2024 - Present",
      location: "Princeton, NJ",
      description: "Led 1K+ trials showing blocked curricula reduced hallucinations by ~25%. Orchestrated 32 prompt variants across 10 models (~47K runs) with 3-4% improvement. Designed VLM Loftus-Palmer study on framing effects."
    },
    {
      company: "Remora Capital",
      position: "Machine Learning Engineer",
      duration: "May 2025 - Sep. 2025",
      location: "Lexington, VA",
      description: "Forecasted S&P 400 MidCap returns using market + news signals. Built hurricane pipeline achieving 78.6% post-landfall accuracy and ~50% lower error."
    },
    {
      company: "MyChance.ai",
      position: "Founding Engineer",
      duration: "Apr. 2025 - Present",
      location: "Princeton, NJ",
      description: "Launched college admissions platform with 3,000+ sign-ups. Implemented AI matching engine and data-driven model reducing overestimated probabilities by 20%."
    },
    {
      company: "Princeton Vision & Learning Lab",
      position: "Machine Learning/Computer Vision Researcher",
      duration: "Sep. 2025 - Present",
      location: "Princeton, NJ",
      description: "Designing video benchmark to evaluate detector robustness across lens settings. Developing simulation loop to recover accuracy under distribution shift."
    },
    {
      company: "COS226 UCA",
      position: "Undergraduate Course Assistant",
      duration: "Sep. 2025 - Present",
      location: "Princeton, NJ",
      description: "Supported 200+ students in Data Structures & Algorithms via grading and targeted feedback; reinforced analysis of graphs, Union-Find, Trees."
    },
    {
      company: "Hoagie Club",
      position: "Software Developer",
      duration: "Sep. 2025 - Present",
      location: "Princeton, NJ",
      description: "Contributing to HoagieMeal team projects and maintaining club infrastructure."
    },
    {
      company: "HackPrinceton",
      position: "Software Developer",
      duration: "Sep. 2025 - Present",
      location: "Princeton, NJ",
      description: "Contributing to development team building web applications for annual hackathon events."
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
          if (hold > 10) { // longer hold before deleting
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
    const id = setInterval(tick, 140); // slightly slower typing
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
        setTimeout(() => {
          row.classList.add('exp-row-in');
          const highlights = row.querySelectorAll('.exp-company .hl-orange');
          highlights.forEach(h => {
            h.classList.remove('hl-show');
            // eslint-disable-next-line no-unused-expressions
            h.offsetWidth; // force reflow to retrigger underline
            h.classList.add('hl-show');
          });
        }, 90 * idx);
      });
      // fade in container after rows are scheduled
      listRef.current.classList.add('exp-visible');
    }, 400);
    return () => clearTimeout(start);
  }, []);

  // Removed infinite scroll; simple static list

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
      <div className="exp-key-row" aria-label="experience key">
        <span className="key-item"><span className="status-dot status-progress"></span>in progress</span>
        <span className="key-item"><span className="status-dot status-complete"></span>completed</span>
      </div>
      <ul className="exp-items">
        <li className="exp-item more">
          <div className="exp-date">{todayStr}</div>
          <div className="exp-body">
            <div className="exp-title"><span>{typed}</span><span className="caret"></span></div>
          </div>
        </li>
        {orderedExperiences.map((exp, index) => {
          const isPresent = (exp.duration || '').toLowerCase().includes('present');
          return (
            <li key={index} className="exp-item">
              <div className="exp-date">{exp.duration || '—'}</div>
              <div className="exp-body">
                <div className="exp-top">
                  <span className="exp-company">
                    <span className={`hl-orange ${isPresent ? 'hl-exp-yellow' : 'hl-exp-sage'}`}>{exp.company}</span>
                  </span>
                  <span className="exp-meta">
                    {exp.position} · {exp.location}
                  </span>
                </div>
                <div className="exp-desc">{exp.description}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ExperienceTimeline; 