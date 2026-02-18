import React from 'react';
import Lottie from 'lottie-react';
import loaderAnimation from '../assets/trail-loading.json';

interface LoaderProps {
  size?: number;
  fullScreen?: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 100, 
  fullScreen = false, 
  message = 'Loading...' 
}) => {
  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 9999,
          backdropFilter: 'blur(2px)',
        }}
      >
        <div style={{ width: size, height: size }}>
          <Lottie animationData={loaderAnimation} loop={true} autoplay={true} />
        </div>
        {message && (
          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '1rem',
              color: '#0075b8',
              fontWeight: '600',
              letterSpacing: '0.5px',
            }}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        minHeight: '200px',
      }}
    >
      <div style={{ width: size, height: size }}>
        <Lottie animationData={loaderAnimation} loop={true} autoplay={true} />
      </div>
      {message && (
        <p
          style={{
            marginTop: '1rem',
            fontSize: '0.9rem',
            color: '#0075b8',
            fontWeight: '600',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
