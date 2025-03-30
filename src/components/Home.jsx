import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import '../styles/Home.css';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroBtnRef = useRef(null);
  const featuresRef = useRef(null);
  const featureCardsRef = useRef([]);
  const dropZoneRef = useRef(null);
  const workflowRef = useRef(null);
  const workflowItemsRef = useRef([]);

  const features = [
    {
      title: 'AI-Powered Organization',
      description: 'Automatically categorize and tag your content using advanced AI algorithms.',
      icon: 'brain',
      color: '#FF6B6B'
    },
    {
      title: 'Smart Summaries',
      description: 'Get instant summaries of long articles and documents.',
      icon: 'document-text',
      color: '#4ECDC4'
    },
    {
      title: 'Cross-Platform Sync',
      description: 'Access your knowledge base across all your devices.',
      icon: 'devices',
      color: '#FFD166'
    },
    {
      title: 'Advanced Search',
      description: 'Find anything instantly with our powerful search capabilities.',
      icon: 'search',
      color: '#6A0572'
    }
  ];

  const workflowSteps = [
    {
      title: 'Capture',
      description: 'Save articles, notes, and ideas from anywhere',
      icon: 'clipboard-list'
    },
    {
      title: 'Organize',
      description: 'Let AI categorize and connect your knowledge',
      icon: 'folder-tree'
    },
    {
      title: 'Discover',
      description: 'Find connections and insights you never knew existed',
      icon: 'lightbulb'
    },
    {
      title: 'Create',
      description: 'Transform your knowledge into new ideas and content',
      icon: 'pencil-alt'
    }
  ];

  useEffect(() => {
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl.fromTo(heroRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 1 }
    )
    .fromTo(heroTitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.5"
    )
    .fromTo(heroTextRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      "-=0.7"
    )
    .fromTo(heroBtnRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      "-=0.5"
    );

    featureCardsRef.current.forEach((card, index) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          delay: index * 0.2
        }
      );
    });

    const workflowTl = gsap.timeline({
      scrollTrigger: {
        trigger: workflowRef.current,
        start: "top 70%"
      }
    });

    workflowTl.fromTo(workflowRef.current.querySelector('h2'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 }
    );

    workflowItemsRef.current.forEach((item, index) => {
      workflowTl.fromTo(item,
        { opacity: 0, x: index % 2 === 0 ? -30 : 30 },
        { opacity: 1, x: 0, duration: 0.6 },
        "-=0.4"
      );
    });

    if (isAuthenticated && dropZoneRef.current) {
      gsap.fromTo(dropZoneRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: dropZoneRef.current,
            start: "top 80%"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [isAuthenticated]);

  const handleExploreClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const navigateToKnowledgeBase = () => {
    navigate('/knowledge-base');
  };

  return (
    <div className="home">
      <section className="hero" ref={heroRef}>
        <div className="hero-content">
          <h1 ref={heroTitleRef}>Turn Information <span className="highlight">Chaos</span> into <span className="highlight">Clarity</span></h1>
          <p ref={heroTextRef}>Your all-in-one knowledge management system powered by AI. Capture, organize, and discover connections you never knew existed.</p>
          <div className="hero-cta" ref={heroBtnRef}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn primary-btn">Go to Dashboard</Link>
            ) : (
              <Link to="/login" className="btn primary-btn">Get Started</Link>
            )}
            <a href="#how-it-works" className="btn secondary-btn">See how it works</a>
          </div>
          <div className="hero-visual">
            <div className="floating-note n1">
              <div className="note-content"></div>
            </div>
            <div className="floating-note n2">
              <div className="note-content"></div>
            </div>
            <div className="floating-note n3">
              <div className="note-content"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features" ref={featuresRef}>
        <h2>Supercharge Your Knowledge</h2>
        <div className="cards-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              ref={el => featureCardsRef.current[index] = el}
              style={{'--accent-color': feature.color}}
            >
              <div className="feature-icon">
                <i className={`icon-${feature.icon}`}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-hover" onClick={handleExploreClick}>
                <span>Explore</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="workflow" ref={workflowRef}>
        <div id="how-it-works" className="section-anchor"></div>
        <h2>How It Works</h2>
        <div className="workflow-container">
          {workflowSteps.map((step, index) => (
            <div 
              key={index} 
              className="workflow-item"
              ref={el => workflowItemsRef.current[index] = el}
            >
              <div className="workflow-icon">
                <i className={`icon-${step.icon}`}></i>
                <div className="workflow-number">{index + 1}</div>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className={`workflow-connector ${index === workflowSteps.length - 1 ? 'hidden' : ''}`}></div>
            </div>
          ))}
        </div>
      </section>

      {isAuthenticated && (
        <section 
          className="drag-drop-area" 
          ref={dropZoneRef} 
          onClick={navigateToKnowledgeBase}
        >
          <div className="inner-drop-zone">
            <div className="drop-zone-icon">
              <i className="icon-upload-cloud"></i>
            </div>
            <h2>Start Adding Content</h2>
            <p></p>
            <div className="click-indicator">
              <span>Click anywhere here to continue</span>
              <i className="icon-arrow-right"></i>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
