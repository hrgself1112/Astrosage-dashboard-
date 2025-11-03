import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="rgb(var(--m3-primary))" />

      {/* Stars constellation pattern */}
      <circle cx="30" cy="30" r="2" fill="white" opacity="0.9" />
      <circle cx="70" cy="25" r="1.5" fill="white" opacity="0.8" />
      <circle cx="50" cy="40" r="1" fill="white" opacity="0.7" />
      <circle cx="35" cy="55" r="2" fill="white" opacity="0.9" />
      <circle cx="65" cy="60" r="1.5" fill="white" opacity="0.8" />
      <circle cx="45" cy="70" r="1" fill="white" opacity="0.7" />
      <circle cx="75" cy="75" r="2" fill="white" opacity="0.9" />
      <circle cx="25" cy="65" r="1.5" fill="white" opacity="0.8" />

      {/* Astrology symbol */}
      <path
        d="M50 25 L45 35 L50 45 L55 35 Z"
        fill="white"
        stroke="rgb(var(--m3-on-primary))"
        strokeWidth="0.5"
      />
      <path
        d="M50 45 L45 55 L50 65 L55 55 Z"
        fill="white"
        stroke="rgb(var(--m3-on-primary))"
        strokeWidth="0.5"
      />
      <circle cx="50" cy="50" r="3" fill="rgb(var(--m3-on-primary))" />

      {/* Orbital rings */}
      <circle
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        opacity="0.6"
      />
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="white"
        strokeWidth="0.3"
        opacity="0.4"
      />
    </svg>
  );
}