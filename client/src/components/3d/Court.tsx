import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';
import { Text, Edges, Html } from '@react-three/drei';
import { motion } from 'framer-motion';

interface CourtProps {
  id: string;
}

export const Court: React.FC<CourtProps> = ({ id }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const surfaceRef = useRef<THREE.Mesh>(null!);
  const pointLightRef = useRef<THREE.PointLight>(null!);
  const spotLightRef = useRef<THREE.SpotLight>(null!);
  
  const courtData = useStore((state) => state.courts.find(c => c.id === id));
  const selectCourt = useStore((state) => state.selectCourt);
  const setHoveredCourt = useStore((state) => state.setHoveredCourt);
  const setStep = useStore((state) => state.setStep);
  
  const matches = useStore((state) => state.matches.filter(m => m.courtId === id && m.status === 'OPEN'));
  const joinMatch = useStore((state) => state.joinMatch);
  const user = useStore((state) => state.user);

  if (!courtData) return null;
  
  const { status, position, name, price, isHot, isDiscount, type } = courtData;

  // Realistic Court Colors based on Type
  const typeColors = {
    BADMINTON: '#065f46', // Deep Premium Green
    PICKLEBALL: '#1e40af', // Professional Deep Blue
    TENNIS: '#9a3412', // Realistic Hard Court / Clay
  };

  const colors = {
    AVAILABLE: typeColors[type as keyof typeof typeColors] || '#065f46',
    HOVER: '#ffffff',
    SELECTED: '#ffffff',
    BOOKED: '#1e293b', // Muted dark slate
    LOCKED: '#991b1b', // Deep red
    MAINTENANCE: '#4b5563', // Gray
    OUT_OF_BOUNDS: '#0f172a'
  };

  // Dimensions based on International Standards
  const dims = {
    BADMINTON: {
      courtWidth: 6.1,
      courtLength: 13.4,
      outerWidth: 9,
      outerLength: 18,
      netHeight: 1.55,
    },
    PICKLEBALL: {
      courtWidth: 6.1,
      courtLength: 13.4,
      outerWidth: 8,
      outerLength: 16,
      netHeight: 0.91,
    },
    TENNIS: {
      courtWidth: 10.97,
      courtLength: 23.77,
      outerWidth: 18,
      outerLength: 36,
      netHeight: 1.07,
    }
  };

  const currentDims = dims[type as keyof typeof dims] || dims.BADMINTON;
  const { courtWidth, courtLength, outerWidth, outerLength, netHeight } = currentDims;

  const materials = useMemo(() => {
    const lines = new THREE.MeshStandardMaterial({ 
      color: '#ffffff',
      emissive: '#ffffff',
      emissiveIntensity: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    
    const linesDim = new THREE.MeshStandardMaterial({ 
      color: '#475569',
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });

    return {
      AVAILABLE: new THREE.MeshStandardMaterial({
        color: colors.AVAILABLE, 
        roughness: type === 'BADMINTON' ? 0.9 : 0.4, 
        metalness: 0.05,
      }),
      HOVER: new THREE.MeshStandardMaterial({
        color: colors.AVAILABLE, 
        roughness: 0.2, 
        metalness: 0.2, 
        emissive: colors.AVAILABLE, 
        emissiveIntensity: 0.1
      }),
      SELECTED: new THREE.MeshStandardMaterial({
        color: colors.AVAILABLE, 
        roughness: 0.1, 
        metalness: 0.4, 
        emissive: colors.AVAILABLE, 
        emissiveIntensity: 0.2
      }),
      BOOKED: new THREE.MeshStandardMaterial({
        color: colors.BOOKED, roughness: 0.9, metalness: 0.05
      }),
      LOCKED: new THREE.MeshStandardMaterial({
        color: colors.LOCKED, roughness: 0.8, metalness: 0.1
      }),
      MAINTENANCE: new THREE.MeshStandardMaterial({
        color: colors.MAINTENANCE, roughness: 1, metalness: 0
      }),
      outOfBounds: new THREE.MeshStandardMaterial({
        color: colors.OUT_OF_BOUNDS, 
        roughness: 1, 
        metalness: 0
      }),
      lines,
      linesDim,
      net: new THREE.MeshStandardMaterial({ 
        color: '#ffffff', 
        transparent: true, 
        opacity: 0.3, 
        side: THREE.DoubleSide,
        alphaTest: 0.1
      }),
      pole: new THREE.MeshStandardMaterial({ 
        color: '#475569', 
        metalness: 0.9, 
        roughness: 0.1,
      }),
    };
  }, [colors, type]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth scaling for selection
    const targetScale = status === 'SELECTED' ? 1.02 : 1;
    meshRef.current.position.y = 0;

    // Update material
    if (surfaceRef.current) {
      surfaceRef.current.material = materials[status] || materials.AVAILABLE;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (status === 'BOOKED' || status === 'LOCKED') {
      // Maybe play a sound or shake here
      return;
    }
    
    if (status === 'SELECTED') {
      selectCourt(null);
      setStep('EXPLORE');
    } else {
      selectCourt(id);
      setStep('SELECT_COURT');
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (status !== 'BOOKED' && status !== 'SELECTED') {
      document.body.style.cursor = 'pointer';
      setHoveredCourt(id);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    if (status === 'HOVER') {
      setHoveredCourt(null);
    }
  };

  const lineWidth = 0.1;
  const lineHeight = 0.02;

  const linesMat = status === 'BOOKED' ? materials.linesDim : materials.lines;

  return (
    <group position={position} ref={meshRef}>
      {/* Invisible Hitbox for better raycasting */}
      <mesh 
        position={[0, 1, 0]} 
        visible={false}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[outerWidth, 2, outerLength]} />
      </mesh>

      {/* Outer Bounds Area (The floor around the court) */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[outerWidth, 0.1, outerLength]} />
        <primitive object={materials.outOfBounds} attach="material" />
        {(status === 'SELECTED' || status === 'HOVER') && (
          <Edges scale={1.02} threshold={15} color={status === 'SELECTED' ? '#ffffff' : '#cbd5e1'} />
        )}
      </mesh>

      {/* Main Playing Surface */}
      <mesh ref={surfaceRef} receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[courtWidth, 0.12, courtLength]} />
        <primitive object={materials.AVAILABLE} attach="material" />
      </mesh>

      {/* --- COURT LINES (Based on Type) --- */}
      <group position={[0, 0.067, 0]}>
        {/* Perimeter */}
        <mesh position={[0, 0, courtLength/2]}><boxGeometry args={[courtWidth, lineHeight, lineWidth]} /><primitive object={linesMat} attach="material" /></mesh>
        <mesh position={[0, 0, -courtLength/2]}><boxGeometry args={[courtWidth, lineHeight, lineWidth]} /><primitive object={linesMat} attach="material" /></mesh>
        <mesh position={[courtWidth/2, 0, 0]}><boxGeometry args={[lineWidth, lineHeight, courtLength]} /><primitive object={linesMat} attach="material" /></mesh>
        <mesh position={[-courtWidth/2, 0, 0]}><boxGeometry args={[lineWidth, lineHeight, courtLength]} /><primitive object={linesMat} attach="material" /></mesh>
        
        {/* Specific Lines for Badminton */}
        {type === 'BADMINTON' && (
          <>
            <mesh position={[0, 0, 0]}><boxGeometry args={[courtWidth, lineHeight, lineWidth]} /><primitive object={linesMat} attach="material" /></mesh>
            <mesh position={[0, 0, 1.98]}><boxGeometry args={[courtWidth, lineHeight, lineWidth]} /><primitive object={linesMat} attach="material" /></mesh>
            <mesh position={[0, 0, -1.98]}><boxGeometry args={[courtWidth, lineHeight, lineWidth]} /><primitive object={linesMat} attach="material" /></mesh>
            <mesh position={[0, 0, (courtLength/2 + 1.98)/2]}><boxGeometry args={[lineWidth, lineHeight, courtLength/2 - 1.98]} /><primitive object={linesMat} attach="material" /></mesh>
            <mesh position={[0, 0, -(courtLength/2 + 1.98)/2]}><boxGeometry args={[lineWidth, lineHeight, courtLength/2 - 1.98]} /><primitive object={linesMat} attach="material" /></mesh>
          </>
        )}

        {/* Specific Lines for Pickleball */}
        {type === 'PICKLEBALL' && (
          <>
            <mesh position={[0, 0, 2.13]}><boxGeometry args={[courtWidth, lineHeight, lineWidth]} /><primitive object={linesMat} attach="material" /></mesh>
            <mesh position={[0, 0, -2.13]}><boxGeometry args={[courtWidth, lineHeight, lineWidth]} /><primitive object={linesMat} attach="material" /></mesh>
            <mesh position={[0, 0, (courtLength/2 + 2.13)/2]}><boxGeometry args={[lineWidth, lineHeight, courtLength/2 - 2.13]} /><primitive object={linesMat} attach="material" /></mesh>
            <mesh position={[0, 0, -(courtLength/2 + 2.13)/2]}><boxGeometry args={[lineWidth, lineHeight, courtLength/2 - 2.13]} /><primitive object={linesMat} attach="material" /></mesh>
          </>
        )}

        {/* Specific Lines for Tennis */}
        {type === 'TENNIS' && (
          <>
            <mesh position={[0, 0, 6.4]}><boxGeometry args={[courtWidth, lineHeight, lineWidth]} /><primitive object={linesMat} attach="material" /></mesh>
            <mesh position={[0, 0, -6.4]}><boxGeometry args={[courtWidth, lineHeight, lineWidth]} /><primitive object={linesMat} attach="material" /></mesh>
            <mesh position={[0, 0, 0]}><boxGeometry args={[lineWidth, lineHeight, 12.8]} /><primitive object={linesMat} attach="material" /></mesh>
          </>
        )}
      </group>

      {/* --- NET & POLES (Mechanical Detail) --- */}
      <group position={[0, 0, 0]}>
        {/* Poles with realistic metal caps */}
        <mesh position={[courtWidth/2 + 0.15, netHeight/2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, netHeight, 16]} />
          <primitive object={materials.pole} attach="material" />
        </mesh>
        <mesh position={[courtWidth/2 + 0.15, netHeight + 0.05, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.1, 16]} />
          <meshStandardMaterial color="#475569" metalness={1} roughness={0.1} />
        </mesh>

        <mesh position={[-courtWidth/2 - 0.15, netHeight/2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, netHeight, 16]} />
          <primitive object={materials.pole} attach="material" />
        </mesh>
        <mesh position={[-courtWidth/2 - 0.15, netHeight + 0.05, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.1, 16]} />
          <meshStandardMaterial color="#475569" metalness={1} roughness={0.1} />
        </mesh>

        {/* Realistic Net with top tape */}
        <mesh position={[0, netHeight * 0.5, 0]} castShadow>
          <planeGeometry args={[courtWidth + 0.3, netHeight]} />
          <primitive object={materials.net} attach="material" />
        </mesh>
        <mesh position={[0, netHeight, 0]}>
          <boxGeometry args={[courtWidth + 0.3, 0.06, 0.03]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
        </mesh>
      </group>
      
      {/* Business Layer Visualization (Badges & Price) */}
      <Html 
        position={[0, 4, 0]} 
        center 
        distanceFactor={10}
        style={{ 
          pointerEvents: 'none', 
          opacity: status === 'SELECTED' ? 1 : 0.9, 
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass px-4 py-2 rounded-2xl flex flex-col items-center gap-1 border-white/20 min-w-[120px]"
          >
            <div className="text-white font-black text-xs uppercase tracking-widest whitespace-nowrap">
              {name}
            </div>
            <div className="h-[1px] w-full bg-white/10 my-1"></div>
            {status === 'BOOKED' ? (
              <div className="text-red-400 font-bold text-[10px] uppercase">Đã đặt chỗ</div>
            ) : status === 'MAINTENANCE' ? (
              <div className="text-gray-400 font-bold text-[10px] uppercase italic">🛠️ Bảo trì</div>
            ) : (
              <div className="text-primary font-bold text-sm">
                {price.toLocaleString()}đ
              </div>
            )}
          </motion.div>
          
          <div className="flex gap-1.5 mt-2">
            {isHot && (
              <motion.span 
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-red-500/40 uppercase tracking-tighter"
              >
                🔥 Hot
              </motion.span>
            )}
            {isDiscount && (
              <span className="bg-yellow-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-yellow-500/40 uppercase tracking-tighter">
                💸 -20%
              </span>
            )}
          </div>

          {/* Social Layer: Open Matches */}
          {matches.length > 0 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-4 glass-dark p-3 rounded-2xl border-indigo-500/30 min-w-[160px] pointer-events-auto"
            >
              <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Trận đấu mở</span>
                <span className="opacity-60">●</span>
              </div>
              {matches.map(match => (
                <div key={match.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-white text-[10px] font-bold">
                    <span>{match.skillLevel}</span>
                    <span>{match.currentPlayers}/{match.maxPlayers}</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-500" 
                      style={{ width: `${(match.currentPlayers / match.maxPlayers) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      joinMatch(match.id);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black py-1.5 rounded-lg transition-all"
                  >
                    THAM GIA NGAY
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </Html>
    </group>
  );
};
