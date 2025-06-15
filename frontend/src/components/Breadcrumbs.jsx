import React from 'react';
import PropTypes from 'prop-types';
import './Breadcrumbs.css'; // Import CSS kamu
import arrow from '../images/arrow.png';

const Breadcrumbs = ({ items = [], separator }) => {
const defaultSeparator = (
    <img
      src={arrow}
      alt="arrow"
      style={{ width: '14px', height: '14px', margin: '0 10px' }}
    />
  );

  return (
    <div className="breadcrumb-background">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          {items.map((item, index) => (
            <li key={index}>
              {item.href ? (
                <a href={item.href} className={item.current ? 'current' : ''}>
                  {item.label}
                </a>
              ) : (
                <span className={item.current ? 'current' : ''}>
                  {item.label}
                </span>
              )}
              {index < items.length - 1 && (separator || defaultSeparator)}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      current: PropTypes.bool,
    })
  ).isRequired,
  separator: PropTypes.node,
};

export default Breadcrumbs;
