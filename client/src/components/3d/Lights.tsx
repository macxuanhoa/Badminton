import React from 'react';
import * as THREE from 'three';

export const Lights: React.FC = () => {
  return (
    <group>
      {/* 1. Realistic Stadium Ambient (Neutral White 4500K) */}
      <ambientLight intensity={0.4} color="#f1f5f9" />

      {/* 2. Main High-Bay Illumination & Shadows (Top-down) */}
      <directionalLight
        position={[0, 30, 75]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        color="#ffffff"
      />

      {/* 3. Sports High-Bay Light Grid (Non-shadow, for Performance) */}
      {/* This simulates the actual 4500K LED panels in the ceiling */}
      <group>
        {/* Pickleball Zone Grid (Z=35) */}
        {[-27, -9, 9, 27].map((x, i) => (
          <spotLight
            key={`p-light-${i}`}
            position={[x, 14, 35]}
            angle={1.0}
            penumbra={0.6}
            intensity={5}
            distance={70}
            decay={2}
            color="#f8fafc"
          />
        ))}

        {/* Badminton Zone Grid (Z=75) */}
        {[-27, -9, 9, 27].map((x, i) => (
          <spotLight
            key={`b-light-${i}`}
            position={[x, 14, 75]}
            angle={1.0}
            penumbra={0.6}
            intensity={6}
            distance={70}
            decay={2}
            color="#f8fafc"
          />
        ))}

        {/* Tennis Court Dedicated Lights (Z=120) */}
        {[-15, 15].map((x, i) => (
          <spotLight
            key={`t-light-${i}`}
            position={[x, 14, 120]}
            angle={1.1}
            penumbra={0.6}
            intensity={7}
            distance={85}
            decay={2}
            color="#ffffff"
          />
        ))}

        {/* Cafe & Reception Accents (Z=10) */}
        <pointLight position={[0, 8, 10]} intensity={1.5} distance={25} color="#fbbf24" />
        <pointLight position={[0, 12, 10]} intensity={1.0} distance={40} color="#f8fafc" />
      </group>
    </group>
  );
};
