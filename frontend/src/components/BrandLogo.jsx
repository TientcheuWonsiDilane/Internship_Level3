import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const BrandLogo = ({
  to,
  className = "",
  imageClassName = "",
  alt = "Metrics logo",
  ariaLabel = "Metrics home",
}) => {
  const content = (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={logo}
        alt={alt}
        className={`block h-10 w-auto sm:h-11 md:h-12 lg:h-12 ${imageClassName}`}
      />
    </span>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} aria-label={ariaLabel} className="inline-flex items-center">
      {content}
    </Link>
  );
};

export default BrandLogo;
