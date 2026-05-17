import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '🎨', title: 'Infinite Canvas', desc: 'Pan, zoom, and build visual maps without limits.' },
  { icon: '⚡', title: 'Real-time Collab', desc: 'See every cursor and change live across your team.' },
  { icon: '🧱', title: 'Smart Blocks', desc: 'Rich blocks with checklists, tags, priority & deadlines.' },
  { icon: '🔗', title: 'Visual Connections', desc: 'Draw arrows between ideas to show flow and dependencies.' },
  { icon: '📜', title: 'Version History', desc: 'Snapshot your work and restore any previous state.' },
  { icon: '🔍', title: 'Global Search', desc: 'Find any block, note or tag instantly across all projects.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">FlowStack</span>
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Get Started Free</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">✨ Visual collaboration, reimagined</div>
        <h1 className="hero-title">
          Build, map & plan<br />
          <span className="hero-gradient">together in real-time</span>
        </h1>
        <p className="hero-subtitle">
          FlowStack combines mind mapping, flowcharting & project planning into one<br />
          beautiful infinite canvas. Inspired by Miro, Notion, and FigJam.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg hero-cta" onClick={() => navigate('/signup')}>
            Start for free →
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
            View demo
          </button>
        </div>

        {/* Mock canvas preview */}
        <div className="hero-canvas-preview">
          <div className="canvas-mock">
            {[
              { top: '12%', left: '8%', color: '#6366f1', label: 'Design System', status: 'done' },
              { top: '10%', left: '40%', color: '#8b5cf6', label: 'Backend API', status: 'in-progress' },
              { top: '10%', left: '70%', color: '#06b6d4', label: 'Frontend', status: 'todo' },
              { top: '55%', left: '20%', color: '#10b981', label: 'Auth Module', status: 'done' },
              { top: '55%', left: '55%', color: '#f59e0b', label: 'Canvas Core', status: 'in-progress' },
            ].map((block, i) => (
              <div key={i} className="mock-block" style={{ top: block.top, left: block.left, borderTopColor: block.color }}>
                <div className="mock-block-title">{block.label}</div>
                <div className={`mock-block-status status-${block.status}`}>{block.status}</div>
              </div>
            ))}
            {/* connection lines */}
            <svg className="mock-connections" viewBox="0 0 800 400" preserveAspectRatio="none">
              <line x1="160" y1="80" x2="340" y2="75" stroke="#6366f133" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="540" y1="75" x2="580" y2="75" stroke="#8b5cf633" strokeWidth="2" />
              <line x1="160" y1="80" x2="200" y2="240" stroke="#6366f133" strokeWidth="2" />
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#6366f166" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <h2 className="section-title">Everything your team needs</h2>
        <p className="section-subtitle">From idea to execution, all in one place.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-box">
          <h2 className="cta-title">Ready to build faster?</h2>
          <p className="cta-subtitle">Join thousands of teams who plan visually with FlowStack.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
            Get started — it's free
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <span>© 2026 FlowStack. Built for collaborative teams.</span>
      </footer>

      <style>{`
        .landing { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg-primary); }

        /* NAV */
        .landing-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 4rem; border-bottom: 1px solid var(--border-color);
          position: sticky; top: 0; background: var(--bg-primary);
          backdrop-filter: blur(12px); z-index: 100;
        }
        .nav-logo { display: flex; align-items: center; gap: 0.5rem; }
        .logo-icon { font-size: 1.5rem; }
        .logo-text { font-family: 'Outfit', sans-serif; font-size: 1.35rem; font-weight: 700; color: var(--text-primary); }
        .nav-actions { display: flex; gap: 0.75rem; }

        /* HERO */
        .hero {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          padding: 5rem 2rem 3rem;
          background: radial-gradient(ellipse at 50% -10%, var(--primary-alpha) 0%, transparent 55%);
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: var(--primary-alpha); color: var(--primary-color);
          border: 1px solid var(--primary-color); border-radius: var(--radius-full);
          padding: 0.3rem 1rem; font-size: 0.82rem; font-weight: 600;
          margin-bottom: 1.75rem;
        }
        .hero-title {
          font-family: 'Outfit', sans-serif; font-size: clamp(2.5rem, 6vw, 4.25rem);
          font-weight: 800; line-height: 1.1; color: var(--text-primary); margin-bottom: 1.25rem;
        }
        .hero-gradient {
          background: var(--gradient-primary); -webkit-background-clip: text;
          -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-subtitle { font-size: 1.125rem; color: var(--text-secondary); line-height: 1.7; max-width: 580px; margin-bottom: 2.5rem; }
        .hero-actions { display: flex; gap: 1rem; justify-content: center; margin-bottom: 3rem; }
        .hero-cta { box-shadow: var(--shadow-glow); }

        /* CANVAS MOCK */
        .hero-canvas-preview {
          width: 100%; max-width: 860px; border-radius: var(--radius-xl);
          border: 1px solid var(--border-color); overflow: hidden;
          box-shadow: var(--shadow-xl); background: var(--bg-secondary);
        }
        .canvas-mock {
          position: relative; width: 100%; height: 320px;
          background: repeating-linear-gradient(0deg, transparent, transparent 24px, var(--border-color) 24px, var(--border-color) 25px),
                      repeating-linear-gradient(90deg, transparent, transparent 24px, var(--border-color) 24px, var(--border-color) 25px);
          background-size: 25px 25px; background-color: var(--bg-secondary);
        }
        .mock-connections { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .mock-block {
          position: absolute; width: 150px;
          background: var(--bg-card); border: 1px solid var(--border-color);
          border-top-width: 3px; border-radius: var(--radius-md);
          padding: 0.75rem 1rem; box-shadow: var(--shadow-sm);
          animation: float 3s ease-in-out infinite alternate;
        }
        .mock-block:nth-child(2) { animation-delay: 0.4s; }
        .mock-block:nth-child(3) { animation-delay: 0.8s; }
        .mock-block:nth-child(4) { animation-delay: 1.2s; }
        .mock-block:nth-child(5) { animation-delay: 1.6s; }
        .mock-block-title { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.4rem; }
        .mock-block-status {
          font-size: 0.68rem; font-weight: 600; text-transform: uppercase;
          padding: 0.15rem 0.5rem; border-radius: var(--radius-full); display: inline-block;
        }
        .status-done { background: rgba(16,185,129,0.15); color: #10b981; }
        .status-in-progress { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .status-todo { background: rgba(99,102,241,0.15); color: #6366f1; }
        @keyframes float { from { transform: translateY(0); } to { transform: translateY(-6px); } }

        /* FEATURES */
        .features-section { padding: 5rem 4rem; text-align: center; }
        .section-title { font-family: 'Outfit', sans-serif; font-size: 2.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
        .section-subtitle { color: var(--text-secondary); font-size: 1.05rem; margin-bottom: 3rem; }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem; max-width: 1000px; margin: 0 auto;
        }
        .feature-card {
          background: var(--bg-card); border: 1px solid var(--border-color);
          border-radius: var(--radius-xl); padding: 2rem 1.5rem; text-align: left;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--primary-color); }
        .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
        .feature-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; }
        .feature-desc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }

        /* CTA */
        .cta-section { padding: 4rem 2rem; display: flex; justify-content: center; }
        .cta-box {
          background: var(--gradient-primary); border-radius: var(--radius-xl);
          padding: 3.5rem 3rem; text-align: center; max-width: 640px; width: 100%;
          box-shadow: var(--shadow-glow);
        }
        .cta-title { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem; }
        .cta-subtitle { color: rgba(255,255,255,0.85); margin-bottom: 2rem; font-size: 1.05rem; }
        .cta-box .btn-primary { background: #fff; color: var(--primary-color); font-weight: 700; }
        .cta-box .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.25); }

        /* FOOTER */
        .landing-footer {
          padding: 1.5rem 4rem; border-top: 1px solid var(--border-color);
          text-align: center; color: var(--text-muted); font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .landing-nav { padding: 1rem 1.5rem; }
          .features-section { padding: 3rem 1.5rem; }
          .hero { padding: 3rem 1.5rem 2rem; }
          .hero-actions { flex-direction: column; align-items: center; }
        }
      `}</style>
    </div>
  );
}
