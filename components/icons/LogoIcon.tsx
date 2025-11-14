import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 200 40"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="30"
      style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700 }}
    >
      <tspan fill="#FFA500">image</tspan>
      <tspan fill="#39FF14">edit</tspan>
    </text>
  </svg>
);