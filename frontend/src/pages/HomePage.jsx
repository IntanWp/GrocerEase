// src/pages/HomePage.jsx
import React from 'react';
import Header from '../components/Header';
import './HomePage.css';

import friedRiceImg from '../images/fried_rice.png';
import pancakeImg from '../images/pancake.png';
import birthdayCakeImg from '../images/birthday_cake.png';
import chocoLavaImg from '../images/choco_lava.png';
import samosaImg from '../images/samosa.png';
import ramenImg from '../images/ramen.png';

import lemonImg from '../images/lemon.png';
import sirloinImg from '../images/sirloin.jpg';
import waterImg from '../images/aqua.png';
import milkImg from '../images/milk.png';
import oilImg from '../images/sunco.png';
import onionImg from '../images/onion.png';

const HomePage = () => {
  return (
    <div>
      <Header />
      <div className="banner">
        <h2>All the best products!</h2>
      </div>

      <div className="section">
        <h3>Recipe Recommendation</h3>
        <div className="card-container">
          {[
            { img: friedRiceImg, title: 'Fried Rice' },
            { img: pancakeImg, title: 'Pancake' },
            { img: birthdayCakeImg, title: 'Birthday Cake' },
            { img: chocoLavaImg, title: 'Choco Lava' },
            { img: samosaImg, title: 'Samosa' },
            { img: ramenImg, title: 'Chicken Ramen' },
          ].map((item, index) => (
            <div className="card" key={index}>
              <img src={item.img} alt={item.title} />
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Product Recommendation</h3>
        <div className="card-container">
          {[
            { img: lemonImg, title: 'Fresh Lemon 1 Kg' },
            { img: sirloinImg, title: 'Pieces of raw sirloin meat 1 Kg' },
            { img: waterImg, title: 'Mineral Water 600 ml' },
            { img: milkImg, title: 'Fresh Milk Varian Matcha 250 ml' },
            { img: oilImg, title: 'Cooking Oil 1L' },
            { img: onionImg, title: 'Red Onion 1 Kg' },
          ].map((item, index) => (
            <div className="card" key={index}>
              <img src={item.img} alt={item.title} />
              <p className="price">Rp 25.000</p>
              <p>{item.title}</p>
              <button className="add-button">+</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
