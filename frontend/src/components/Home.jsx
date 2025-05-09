import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  
  useEffect(() => {
    // Parallax effect on scroll
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroOverlay = document.querySelector('.hero-overlay');
      if (heroOverlay) {
        heroOverlay.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
      
      const popularSectionBg = document.querySelector('.popular-section-bg');
      if (popularSectionBg) {
        popularSectionBg.style.transform = `translateY(${scrollY * 0.2}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      {/* Hero Section with Video or Image Background */}
      <div className="hero-section position-relative overflow-hidden">
        <div className="hero-overlay position-absolute w-100 h-100 top-0 start-0"></div>
        <div className="hero-bg position-absolute w-100 h-100 top-0 start-0" 
             style={{
               backgroundImage: 'url(https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1800)',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               filter: 'brightness(0.7)',
               zIndex: '-1'
             }}>
        </div>
        <div className="container position-relative py-5 hero-content">
          <div className="row min-vh-80 d-flex align-items-center py-5">
            <div className="col-lg-7 text-white">
              <h1 className="display-3 fw-bold animate-fade-up mb-0">Share Your Culinary Masterpieces</h1>
              <h2 className="display-6 fw-light animate-fade-up mb-4">with the world</h2>
              <p className="lead animate-fade-up fs-4 mb-5" style={{animationDelay: '0.3s'}}>
                Discover recipes, share your creations, and connect with food lovers around the globe.
              </p>
              <div className="d-flex flex-wrap gap-3 animate-fade-up" style={{animationDelay: '0.5s'}}>
                <Link to="/posts" className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold">
                  <i className="bi bi-grid-3x3-gap me-2"></i> Explore Recipes
                </Link>
                {!currentUser ? (
                  <Link to="/register" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill fw-bold">
                    <i className="bi bi-person-plus me-2"></i> Join Now
                  </Link>
                ) : (
                  <Link to="/posts/create" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill fw-bold">
                    <i className="bi bi-camera me-2"></i> Share Your Dish
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Food Categories */}
      <div className="categories-section py-5 bg-light">
        <div className="container py-3">
          <h2 className="text-center mb-5 display-5 fw-bold">Explore <span className="text-primary">Categories</span></h2>
          <div className="row g-4">
            {[
              { name: 'Breakfast', icon: 'bi-egg-fried', color: '#FFBC42' },
              { name: 'Main Dishes', icon: 'bi-egg', color: '#D81159' },
              { name: 'Desserts', icon: 'bi-cake2', color: '#8F2D56' },
              { name: 'Vegetarian', icon: 'bi-flower1', color: '#218380' }
            ].map((category, index) => (
              <div className="col-6 col-md-3" key={index}>
                <Link to={`/posts/tag/${category.name.toLowerCase()}`} className="text-decoration-none">
                  <div className="category-card h-100 p-4 bg-white rounded-4 shadow-sm text-center animate-fade-up" 
                       style={{animationDelay: `${0.1 * index}s`, transition: 'all 0.3s ease'}}>
                    <div className="category-icon-wrapper mb-3">
                      <i className={`bi ${category.icon}`} style={{fontSize: '3rem', color: category.color}}></i>
                    </div>
                    <h4 className="mb-0 fw-bold">{category.name}</h4>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Featured Recipes Section */}
      <div className="popular-section position-relative py-5">
        <div className="popular-section-bg position-absolute w-100 h-100 top-0 start-0" 
             style={{
               backgroundImage: 'url(https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1800)',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               filter: 'brightness(0.2)',
               zIndex: '-1'
             }}></div>
        <div className="container position-relative py-5">
          <h2 className="text-center mb-5 display-5 fw-bold text-white">Trending <span className="text-primary">Recipes</span></h2>
          <div className="row g-4">
            {[
              {
                title: 'Homemade Pasta Carbonara',
                author: 'ChefMaria',
                likes: 342,
                image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400'
              },
              {
                title: 'Avocado Toast with Poached Egg',
                author: 'HealthyEats',
                likes: 289,
                image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400'
              },
              {
                title: 'Thai Green Curry',
                author: 'SpiceKing',
                likes: 217,
                image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=400'
              }
            ].map((recipe, index) => (
              <div className="col-md-4" key={index}>
                <div className="recipe-card h-100 rounded-4 overflow-hidden position-relative animate-fade-up shadow" 
                     style={{animationDelay: `${0.1 * index}s`}}>
                  <div className="recipe-image position-relative" 
                       style={{height: '280px', backgroundImage: `url(${recipe.image})`, backgroundSize: 'cover'}}>
                    <div className="overlay position-absolute w-100 h-100 top-0 start-0 bg-dark" 
                         style={{opacity: '0.2'}}></div>
                  </div>
                  <div className="recipe-content p-4 bg-white">
                    <h4 className="fw-bold mb-2">{recipe.title}</h4>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">By @{recipe.author}</span>
                      <div>
                        <i className="bi bi-heart-fill me-1 text-danger"></i>
                        <span>{recipe.likes}</span>
                      </div>
                    </div>
                  </div>
                  <Link to="/posts" className="stretched-link"></Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link to="/posts" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill fw-bold animate-fade-up">
              <i className="bi bi-grid-3x3-gap me-2"></i> Discover More Recipes
            </Link>
          </div>
        </div>
      </div>
      
      {/* Join Community Section */}
      <div className="join-section py-5 bg-white">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 pe-lg-5 mb-5 mb-lg-0">
              <div className="join-image-stack position-relative animate-fade-right">
                <div className="image-1 position-relative rounded-4 overflow-hidden shadow-lg" 
                     style={{height: '350px', zIndex: '2', transform: 'rotate(-5deg)'}}>
                  <img src="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600" 
                       alt="People cooking together" className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="image-2 position-absolute top-50 start-50 rounded-4 overflow-hidden shadow-lg" 
                     style={{height: '250px', width: '70%', transform: 'translate(-40%, 10%) rotate(8deg)', zIndex: '1'}}>
                  <img src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=500" 
                       alt="Food sharing" className="w-100 h-100 object-fit-cover" />
                </div>
              </div>
            </div>
            <div className="col-lg-6 ps-lg-5 animate-fade-left">
              <span className="badge bg-primary text-white fs-6 px-3 py-2 mb-3">Join Our Community</span>
              <h2 className="display-5 fw-bold mb-4">Connect with Food <span className="text-primary">Enthusiasts</span></h2>
              <p className="lead mb-4 fs-5">
                Share your recipes, get feedback, and discover amazing dishes from cooks around the world. 
                Whether you're a professional chef or a home cook, there's a place for you in our community.
              </p>
              <div className="features mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-icon me-3 bg-primary bg-opacity-10 p-3 rounded-circle">
                    <i className="bi bi-camera text-primary fs-4"></i>
                  </div>
                  <div>Share your culinary creations</div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-icon me-3 bg-primary bg-opacity-10 p-3 rounded-circle">
                    <i className="bi bi-people text-primary fs-4"></i>
                  </div>
                  <div>Connect with other food lovers</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="feature-icon me-3 bg-primary bg-opacity-10 p-3 rounded-circle">
                    <i className="bi bi-book text-primary fs-4"></i>
                  </div>
                  <div>Discover new recipes and techniques</div>
                </div>
              </div>
              {!currentUser ? (
                <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold">
                  <i className="bi bi-person-plus me-2"></i> Join Now
                </Link>
              ) : (
                <Link to="/posts/create" className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold">
                  <i className="bi bi-camera me-2"></i> Share Your Dish
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
