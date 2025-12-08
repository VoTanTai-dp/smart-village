import React from 'react';
import './HomePage.scss';
import { useHistory } from "react-router-dom";

const HomePage = (props) => {
    let history = useHistory();

    return (
        <div className="homepage-container pt-3">
            <div className="content-wrapper">

                {/* Hero Section */}
                <section className="hero-section">
                    <div className="container">
                        <div className="hero-bg d-flex flex-column align-items-center justify-content-center text-center p-4 p-md-5 rounded-4">
                            <div className="hero-content max-w-2xl">
                                <h1 className="hero-title mb-3">Centralized Rural Monitoring and Safety, Simplified.</h1>
                                <h2 className="hero-subtitle mb-4">Connect and manage your IP cameras, IoT sensors, and AI-powered safety features from a single, unified dashboard for comprehensive management.</h2>
                                <button className="btn btn-primary text-dark fw-bold px-4 py-2 rounded-3" onClick={() => history.push('/register')}>
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section py-5">
                    <div className="container">
                        <div className="section-header text-center mb-5">
                            <h2 className="fw-bold mb-3 section-title">One Platform, Total Control</h2>
                            <p className="section-desc mx-auto">Our portal provides a comprehensive suite of tools to manage your rural operations with confidence. From live camera feeds to intelligent alerts, everything you need is right at your fingertips.</p>
                        </div>

                        <div className="row g-4">
                            {/* Feature 1 */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="feature-card">
                                    <div className="feature-img mb-3" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000")' }}></div>
                                    <h5 className="text-white fw-bold">IP Camera Management</h5>
                                    <p className="text-secondary-custom">Easily connect and manage all your IP cameras, regardless of the brand, in one centralized location.</p>
                                </div>
                            </div>
                            {/* Feature 2 */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="feature-card">
                                    <div className="feature-img mb-3" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000")' }}></div>
                                    <h5 className="text-white fw-bold">Unified Dashboard</h5>
                                    <p className="text-secondary-custom">View all your live feeds simultaneously on a customizable, intuitive monitoring dashboard.</p>
                                </div>
                            </div>
                            {/* Feature 3 */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="feature-card">
                                    <div className="feature-img mb-3" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000")' }}></div>
                                    <h5 className="text-white fw-bold">IoT Sensor Integration</h5>
                                    <p className="text-secondary-custom">Link temperature and humidity sensors to each camera for enriched, proactive environmental monitoring.</p>
                                </div>
                            </div>
                            {/* Feature 4 */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="feature-card">
                                    <div className="feature-img mb-3" style={{ backgroundImage: 'url("https://plus.unsplash.com/premium_photo-1683121366070-5ceb7e007a97?auto=format&fit=crop&q=80&w=1000")' }}></div>
                                    <h5 className="text-white fw-bold">AI Safety Features</h5>
                                    <p className="text-secondary-custom">Leverage AI for automated fire detection and no-helmet alerts, enhancing safety and security on-site.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Preview Section */}
                <section className="preview-section py-4">
                    <div className="container">
                        <h3 className="text-center text-white fw-bold mb-4">See It All in Action</h3>
                        <div className="preview-container rounded-4 border border-white-10 overflow-hidden">
                            {/* Placeholder ảnh Dashboard */}
                            <div className="preview-img bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000")', height: '400px', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="testimonials-section py-5">
                    <div className="container">
                        <div className="text-center mb-5">
                            <h2 className="fw-bold text-white">Trusted by Operations Managers</h2>
                            <p className="text-white-80">Hear what our partners have to say about the platform.</p>
                        </div>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="testimonial-card p-4 rounded-3">
                                    <p className="fst-italic text-white-90 mb-3">"This portal has transformed how we manage our remote sites. The unified dashboard and AI alerts give us peace of mind we never had before."</p>
                                    <div className="d-flex align-items-center">
                                        <div className="avatar me-3 rounded-circle bg-secondary" style={{ width: '48px', height: '48px' }}></div>
                                        <div>
                                            <p className="fw-bold mb-0 text-white">John Doe</p>
                                            <p className="small text-white-60 mb-0">Farm Operations Manager</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="testimonial-card p-4 rounded-3">
                                    <p className="fst-italic text-white-90 mb-3">"The integration of IoT sensors with live camera feeds is a game-changer. We can now proactively address environmental issues before they become problems."</p>
                                    <div className="d-flex align-items-center">
                                        <div className="avatar me-3 rounded-circle bg-secondary" style={{ width: '48px', height: '48px' }}></div>
                                        <div>
                                            <p className="fw-bold mb-0 text-white">Jane Smith</p>
                                            <p className="small text-white-60 mb-0">Remote Worksites Supervisor</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section py-5">
                    <div className="container">
                        <div className="cta-box bg-primary-subtle rounded-4 p-5 text-center">
                            <h2 className="fw-bold text-white mb-3">Ready to Enhance Your Rural Operations?</h2>
                            <p className="text-white-80 mb-4 max-w-2xl mx-auto">Get a complete overview of your properties, ensure safety with AI-powered alerts, and manage everything from one simple dashboard.</p>
                            <button className="btn btn-primary text-dark fw-bold px-4 py-2">Request a Demo</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default HomePage
