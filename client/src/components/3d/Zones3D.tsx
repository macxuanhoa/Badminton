import React, { useRef } from 'react';
import { Text, Box, Cylinder, Torus } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const Zones3D: React.FC = () => {
  const domeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const ceilingMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const trussMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    // Fixed visibility, no fade out
    if (domeMatRef.current) domeMatRef.current.opacity = 1;
    if (ceilingMatRef.current) ceilingMatRef.current.opacity = 0.8;
    if (trussMatRef.current) trussMatRef.current.opacity = 1;
  });

  return (
    <group>
      {/* --- INDUSTRIAL INDOOR STRUCTURE (Scale: Meters) --- */}
      {/* Facility Dimensions: 72m (W) x 150m (D) x 15m (H) */}
      
      {/* 1. MAIN SHELL & WALLS */}
      <group>
        {/* Floor Plane (Polished Concrete Texture Base) */}
        <Box args={[72, 0.1, 150]} position={[0, -0.05, 75]}>
          <meshStandardMaterial color="#b9c0c9" roughness={0.6} metalness={0.05} />
        </Box>

        {/* Outer Walls (Industrial Anthracite) */}
        {/* Rear Wall */}
        <Box args={[72, 15, 1]} position={[0, 7.5, 150]}>
          <meshStandardMaterial color="#64748b" roughness={0.9} metalness={0.02} />
        </Box>
        {/* Side Walls */}
        <Box args={[1, 15, 150]} position={[-36, 7.5, 75]}>
          <meshStandardMaterial color="#64748b" roughness={0.9} metalness={0.02} />
        </Box>
        <Box args={[1, 15, 150]} position={[36, 7.5, 75]}>
          <meshStandardMaterial color="#64748b" roughness={0.9} metalness={0.02} />
        </Box>
        {/* Front Wall with Glass Entrance Area */}
        <Box args={[72, 15, 1]} position={[0, 7.5, 0]}>
          <meshStandardMaterial color="#475569" roughness={0.85} metalness={0.02} />
        </Box>
        <Box args={[50, 10, 0.08]} position={[0, 8, 0.55]}>
          <meshStandardMaterial color="#dbeafe" roughness={0.05} metalness={0.1} transparent opacity={0.12} />
        </Box>
        <Box args={[72, 1.2, 0.4]} position={[0, 0.6, 149.6]}>
          <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.05} />
        </Box>
        <Box args={[0.4, 1.2, 150]} position={[-35.8, 0.6, 75]}>
          <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.05} />
        </Box>
        <Box args={[0.4, 1.2, 150]} position={[35.8, 0.6, 75]}>
          <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.05} />
        </Box>
      </group>

      <mesh position={[0, 15, 75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[40, 40, 150, 48, 1, true, 0, Math.PI]} />
        <meshStandardMaterial ref={domeMatRef} color="#0f172a" roughness={0.98} metalness={0.03} side={THREE.BackSide} transparent />
      </mesh>

      {/* 2. INDUSTRIAL ROOF STRUCTURE (Steel Trusses & High Ceiling) */}
      <group position={[0, 15, 75]}>
        {/* Ceiling Panels */}
        <Box args={[72, 0.5, 150]} position={[0, 0.25, 0]}>
          <meshStandardMaterial ref={ceilingMatRef} color="#0f172a" roughness={1} transparent />
        </Box>
        
        {/* Main Steel Trusses (Transverse every 15m) */}
        {Array(11).fill(null).map((_, i) => (
          <group key={`truss-${i}`} position={[0, -1, (i - 5) * 15]}>
            {/* Top Beam */}
            <Box args={[72, 0.4, 0.4]}>
              <meshStandardMaterial ref={trussMatRef} color="#334155" metalness={0.75} roughness={0.25} transparent />
            </Box>
            {/* Structural Support Columns (Side) */}
            <Box args={[0.6, 15, 0.6]} position={[-35.5, -7.5, 0]}>
          <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.25} />
            </Box>
            <Box args={[0.6, 15, 0.6]} position={[35.5, -7.5, 0]}>
          <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.25} />
            </Box>
            {/* V-Shape Truss Bracing (Simplified) */}
            {Array(6).fill(null).map((_, j) => (
              <Box 
                key={`brace-${j}`} 
                args={[0.2, 3, 0.2]} 
                position={[(j - 2.5) * 12, -1.2, 0]}
                rotation={[0, 0, j % 2 === 0 ? Math.PI / 4 : -Math.PI / 4]}
              >
                <meshStandardMaterial ref={trussMatRef} color="#475569" metalness={0.8} roughness={0.2} transparent />
              </Box>
            ))}
          </group>
        ))}
      </group>

      {/* 3. STEPPED STADIUM SEATING (Professional Tiers) */}
      {/* Placement: Between zones to provide viewing angles */}
      {[28, 62, 100].map((zPos, idx) => (
        <group key={`seating-strip-${idx}`} position={[0, 0, zPos]}>
          {/* Main Seating Block (Left Side) */}
          <group position={[-25, 0, 0]}>
            {Array(6).fill(null).map((_, i) => {
              const seatColor = i < 2 ? '#ef4444' : i < 4 ? '#f59e0b' : '#3b82f6';
              return (
                <group key={`tier-${i}`} position={[0, i * 0.45 + 0.22, -i * 1.1]}>
                  {/* Step Concrete */}
                  <Box args={[16, 0.45, 1.1]}>
                    <meshStandardMaterial color="#334155" roughness={0.8} />
                  </Box>
                  {/* Individual Seats (Plastic Shell style) */}
                  {Array(18).fill(null).map((_, j) => (
                    <group key={`seat-g-${j}`} position={[(j - 8.5) * 0.85, 0.25, -0.2]}>
                      {/* Seat Base */}
                      <Box args={[0.65, 0.1, 0.65]}>
                        <meshStandardMaterial color={seatColor} roughness={0.5} />
                      </Box>
                      {/* Seat Backrest - Facing +Z means back is at -Z relative to sitting pos */}
                      <Box args={[0.65, 0.5, 0.1]} position={[0, 0.25, -0.3]}>
                        <meshStandardMaterial color={seatColor} roughness={0.5} />
                      </Box>
                    </group>
                  ))}
                </group>
              );
            })}
            {/* Front Railing */}
            <Box args={[16, 1.1, 0.05]} position={[0, 1.0, 0.55]}>
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} transparent opacity={0.3} />
            </Box>
          </group>

          {/* Main Seating Block (Right Side) */}
          <group position={[25, 0, 0]}>
            {Array(6).fill(null).map((_, i) => {
              const seatColor = i < 2 ? '#ef4444' : i < 4 ? '#f59e0b' : '#3b82f6';
              return (
                <group key={`tier-r-${i}`} position={[0, i * 0.45 + 0.22, -i * 1.1]}>
                  <Box args={[16, 0.45, 1.1]}>
                    <meshStandardMaterial color="#334155" roughness={0.8} />
                  </Box>
                  {Array(18).fill(null).map((_, j) => (
                    <group key={`seat-rg-${j}`} position={[(j - 8.5) * 0.85, 0.25, -0.2]}>
                      <Box args={[0.65, 0.1, 0.65]}>
                        <meshStandardMaterial color={seatColor} roughness={0.5} />
                      </Box>
                      <Box args={[0.65, 0.5, 0.1]} position={[0, 0.25, -0.3]}>
                        <meshStandardMaterial color={seatColor} roughness={0.5} />
                      </Box>
                    </group>
                  ))}
                </group>
              );
            })}
            {/* Front Railing */}
            <Box args={[16, 1.1, 0.05]} position={[0, 1.0, 0.55]}>
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} transparent opacity={0.3} />
            </Box>
          </group>
        </group>
      ))}

      <group>
        {[
          { z: 18, w: 68, h: 6 },
          { z: 50, w: 68, h: 7 },
          { z: 95, w: 68, h: 7 },
        ].map((p) => (
          <group key={`divider-${p.z}`} position={[0, 0, p.z]}>
            <mesh position={[0, p.h / 2, 0]}>
              <planeGeometry args={[p.w, p.h, 24, 6]} />
              <meshStandardMaterial color="#94a3b8" wireframe transparent opacity={0.18} side={THREE.DoubleSide} />
            </mesh>
            {Array(Math.floor(p.w / 8) + 1)
              .fill(null)
              .map((_, i) => {
                const x = -p.w / 2 + i * 8
                return (
                  <mesh key={`post-${p.z}-${i}`} position={[x, p.h / 2, 0]} castShadow>
                    <cylinderGeometry args={[0.06, 0.06, p.h, 12]} />
                    <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
                  </mesh>
                )
              })}
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[p.w, 0.35, 0.25]} />
              <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.05} />
            </mesh>
          </group>
        ))}
      </group>

      <group position={[0, 0, 120]}>
        {(() => {
          const w = 18
          const l = 36
          const h = 4.5
          const hw = w / 2
          const hl = l / 2
          const mat = (
            <meshStandardMaterial color="#94a3b8" wireframe transparent opacity={0.2} side={THREE.DoubleSide} />
          )
          return (
            <group>
              <mesh position={[0, h / 2, hl]}>
                <planeGeometry args={[w, h, 12, 6]} />
                {mat}
              </mesh>
              <mesh position={[0, h / 2, -hl]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[w, h, 12, 6]} />
                {mat}
              </mesh>
              <mesh position={[hw, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[l, h, 18, 6]} />
                {mat}
              </mesh>
              <mesh position={[-hw, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[l, h, 18, 6]} />
                {mat}
              </mesh>
              {[
                [hw, 0, hl],
                [-hw, 0, hl],
                [hw, 0, -hl],
                [-hw, 0, -hl],
              ].map((p, i) => (
                <mesh key={`t-post-${i}`} position={[p[0], h / 2, p[2]]} castShadow>
                  <cylinderGeometry args={[0.08, 0.08, h, 12]} />
                  <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
                </mesh>
              ))}
              <mesh position={[0, 0.18, 0]}>
                <boxGeometry args={[w + 0.6, 0.28, l + 0.6]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.05} />
              </mesh>
            </group>
          )
        })()}
      </group>

      {/* 4. ELEVATED CAFE & ENTRANCE HUB */}
      <group position={[0, 0, 10]}>
        {/* Ground Floor: Reception & Pro Shop */}
        <Box args={[30, 4, 15]} position={[0, 2, 0]}>
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.03} />
        </Box>
        <Text position={[-18, 2.2, 6.8]} rotation={[0, Math.PI, 0]} fontSize={1.0} color="#0f172a">ELYRA RECEPTION</Text>

        {/* Elevated Cafe (Tầng lửng) */}
        <group position={[0, 4.5, 5]}>
          {/* Cafe Floor */}
          <Box args={[40, 0.5, 15]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#5b4636" metalness={0.05} roughness={0.65} />
          </Box>
          {/* Glass Railing overlooking courts */}
          <Box args={[40, 1.2, 0.1]} position={[0, 0.85, 7.5]}>
            <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0} transparent opacity={0.2} />
          </Box>
          {/* Cafe Tables & Chairs */}
          {Array(6).fill(null).map((_, i) => (
            <group key={`table-${i}`} position={[(i - 2.5) * 6, 0.25, 0]}>
              <Cylinder args={[0.8, 0.8, 0.1, 16]} position={[0, 0.8, 0]}>
                <meshStandardMaterial color="#f8fafc" />
              </Cylinder>
              <Cylinder args={[0.1, 0.1, 0.8, 8]} position={[0, 0.4, 0]}>
                <meshStandardMaterial color="#475569" />
              </Cylinder>
            </group>
          ))}
          <Text position={[0, 3, 5]} fontSize={1.8} color="#fbbf24">VIP VIEWING HUB</Text>
        </group>

        {/* Access Stairs to Cafe */}
        <group position={[-18, 0, 0]}>
          {Array(15).fill(null).map((_, i) => (
            <Box key={`stair-${i}`} args={[4, 0.3, 0.4]} position={[0, i * 0.3 + 0.15, (i - 7) * 0.4]}>
              <meshStandardMaterial color="#475569" />
            </Box>
          ))}
        </group>
      </group>

      {/* 5. WALKING PATHS & CIRCULATION */}
      <group>
        {/* Main Central Corridor (X=0) */}
        <Box args={[4, 0.05, 150]} position={[0, 0.03, 75]}>
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </Box>
        {/* Side Corridors */}
        <Box args={[1, 0.05, 150]} position={[-34, 0.03, 75]}>
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </Box>
        <Box args={[1, 0.05, 150]} position={[34, 0.03, 75]}>
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </Box>
        {/* Zone Separator Lines (Painted on floor) */}
        {[18, 50, 95].map(z => (
          <Box key={`sep-${z}`} args={[72, 0.02, 0.2]} position={[0, 0.02, z]}>
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.5} />
          </Box>
        ))}
      </group>

      {/* 6. BRANDING & SIGNAGE */}
      <group position={[0, 12, 149.4]}>
        <Text position={[0, 0, 0]} fontSize={6} color="#4f46e5" rotation={[0, Math.PI, 0]}>ELYRA SPORTS ARENA</Text>
      </group>
    </group>
  );
};
