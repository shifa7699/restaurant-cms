import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedLoginType, setSelectedLoginType] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [foodTypeFilter, setFoodTypeFilter] = useState(''); // 'veg', 'non-veg', or ''
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const categories = ["Drinks", "Desserts", "Kid's Menu", "Indian", "Chinese", "Continental"];

  const categoryImages = {
    "Drinks": "/ai-generated-8406380_1280.png",
    "Desserts": "/dessert.jpg",
    "Kid's Menu": "/kids.jpg",
    "Indian": "/indian.jpg",
    "Chinese": "/chinese.jpg",
    "Continental": "/continental.jpg"
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/menu")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched menu data:", data);
        console.log("Veg items:", data.filter(item => item.category === "veg"));
        console.log("Non-veg items:", data.filter(item => item.category === "non-veg"));
        setMenuItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching menu:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLoginClick = (type) => {
    setSelectedLoginType(type);
    setShowLoginModal(true);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `userid=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(selectedLoginType.toLowerCase())}`,
      });

      const data = await response.json();
      if (data.success) {
        // Store user email in sessionStorage for frontend access
        if (data.email) {
          sessionStorage.setItem('userEmail', data.email);
        }
        window.location.href = data.redirect;
      } else {
        setError(data.error || 'Invalid credentials!');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const getItemsByCategory = (category) => {
    let items = menuItems.filter(item => item.category === category);
    // Apply food type filter for categories that support it (not Drinks, Desserts)
    if (foodTypeFilter && category !== "Drinks" && category !== "Desserts") {
      items = items.filter(item => item.foodType === foodTypeFilter);
    }
    return items;
  };

  // Categories that support veg/non-veg filtering
  const categoriesWithFoodType = ["Kid's Menu", "Indian", "Chinese", "Continental"];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const selectedCategoryItems = selectedCategory ? getItemsByCategory(selectedCategory) : [];

  return (
    <div className="App">
      <header className="navbar">
        <h1 className="logo">
          <img src="/restaurant (1).png" alt="Restaurant Icon" className="restaurant-icon" />
          Spice Garden
        </h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/contacts">Contacts</Link>
          <div className="login-dropdown" ref={dropdownRef}>
            <button onClick={() => setShowLoginDropdown(!showLoginDropdown)} className="login-btn">Login</button>
            {showLoginDropdown && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { handleLoginClick('User'); setShowLoginDropdown(false); }}>User Login</button>
                <button onClick={() => { handleLoginClick('Staff'); setShowLoginDropdown(false); }}>Staff Login</button>
                <button onClick={() => { handleLoginClick('Admin'); setShowLoginDropdown(false); }}>Admin Login</button>
                {/* <button onClick={() => { window.location.href = 'http://localhost:8080/register.html'; setShowLoginDropdown(false); }}>Register New User</button> */}
              </div>
            )}
          </div>
        </nav>
      </header>

      <section className="menu-page">
        {selectedCategory ? (
          // Category Detail View
          <div className="category-detail-view">
            <button className="back-btn" onClick={handleBackToCategories}>
              ← Back to Categories
            </button>
            <h1 className="menu-title">{selectedCategory}</h1>
            
            {/* Food Type Filter Buttons - Only for categories that support it */}
            {categoriesWithFoodType.includes(selectedCategory) && (
              <div className="filter-buttons" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button 
                  className={`filter-btn ${foodTypeFilter === '' ? 'active' : ''}`}
                  onClick={() => setFoodTypeFilter('')}
                  style={{ padding: '8px 20px', margin: '0 5px', background: foodTypeFilter === '' ? '#f5576c' : '#ddd', color: foodTypeFilter === '' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${foodTypeFilter === 'veg' ? 'active' : ''}`}
                  onClick={() => setFoodTypeFilter('veg')}
                  style={{ padding: '8px 20px', margin: '0 5px', background: foodTypeFilter === 'veg' ? '#4CAF50' : '#ddd', color: foodTypeFilter === 'veg' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}
                >
                  🌱 Vegetarian
                </button>
                <button 
                  className={`filter-btn ${foodTypeFilter === 'non-veg' ? 'active' : ''}`}
                  onClick={() => setFoodTypeFilter('non-veg')}
                  style={{ padding: '8px 20px', margin: '0 5px', background: foodTypeFilter === 'non-veg' ? '#f44336' : '#ddd', color: foodTypeFilter === 'non-veg' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}
                >
                  🍖 Non-Veg
                </button>
              </div>
            )}
            
            {loading ? (
              <p className="loading-text">Loading menu...</p>
            ) : selectedCategoryItems.length === 0 ? (
              <p className="loading-text">No items in this category yet.</p>
            ) : (
              <div className="menu-grid">
                {selectedCategoryItems.map((item) => (
                  <div key={item._id} className="menu-card">
                    <img
                      src={`http://localhost:8080${item.image}`}
                      alt={item.name}
                      className="menu-img"
                    />
                    <h4>
                      {item.foodType === 'veg' && <span style={{ color: 'green', marginRight: '5px' }}>🌱</span>}
                      {item.foodType === 'non-veg' && <span style={{ color: 'red', marginRight: '5px' }}>🍖</span>}
                      {item.name}
                    </h4>
                    <p>₹{item.price}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // All Categories View
          <div>
            <h1 className="menu-title">Our Menu</h1>
            {loading ? (
              <p className="loading-text">Loading menu...</p>
            ) : menuItems.length === 0 ? (
              <p className="loading-text">No menu items found. Please add some dishes from the admin dashboard.</p>
            ) : (
              <div className="category-cards">
                {categories.map((category) => {
                  const items = getItemsByCategory(category);
                  return (
                    <div 
                      key={category} 
                      className={`category-card ${category === "Drinks" ? "drinks-card" : ""} ${category === "Chinese" ? "chinese-card" : ""} ${category === "Indian" ? "indian-card" : ""} ${category === "Kid's Menu" ? "kids-card" : ""} ${category === "Desserts" ? "desserts-card" : ""} ${category === "Continental" ? "continental-card" : ""}`}
                      onClick={() => handleCategoryClick(category)}
                      style={{ cursor: 'pointer' }}
                    >
                      <h2>{category}</h2>
                      {categoryImages[category] && (
                        <img 
                          src={categoryImages[category]} 
                          alt={category} 
                          className="category-image"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedLoginType} Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>{selectedLoginType === 'User' ? 'Email:' : 'Username:'}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="login-submit-btn">Login</button>
            </form>
            {selectedLoginType === 'User' && (
              <p className="register-link">
                New user? <button type="button" className="register-btn-link" onClick={() => window.location.href = 'http://localhost:8080/register.html'}>Register here</button>
              </p>
            )}
            <button className="close-modal" onClick={() => setShowLoginModal(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;

