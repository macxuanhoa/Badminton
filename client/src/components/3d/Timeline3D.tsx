import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';
import { Text, Float } from '@react-three/drei';
import { socketService } from '../../services/socket.service';

interface SlotProps {
  id: string;
  time: string;
  position: [number, number, number];
  isLocked: boolean;
  price: number;
  lockId: string;
}

const Slot: React.FC<SlotProps> = ({ id, time, position, isLocked, price, lockId }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const boxRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const setStep = useStore((state) => state.setStep);
  const setSelectedSlot = useStore((state) => state.setSelectedSlot);
  const selectedSlotId = useStore((state) => state.selectedSlot?.id);
  const isSelected = selectedSlotId === time;
  
  // Spring animation state
  const [targetY, setTargetY] = useState(0);
  
  useEffect(() => {
    // Just ensure it's 0
    setTargetY(0);
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || !boxRef.current) return;

    // 1. Position Y Animation (Pop up from ground & Hover float)
    let currentTargetY = targetY;
    if (currentTargetY === 0) {
      if (isSelected) currentTargetY = 0.5;
      else if (hovered && !isLocked) currentTargetY = 0.2;
      else if (isLocked) currentTargetY = -0.1; // Squashed
    }
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, currentTargetY, delta * 5);

    // 2. Scale Animation
    const targetScaleY = isLocked ? 0.2 : isSelected ? 1.5 : 1;
    boxRef.current.scale.y = THREE.MathUtils.lerp(boxRef.current.scale.y, targetScaleY, delta * 5);

    // 3. Colors & Materials
    let targetColor = new THREE.Color('#334155'); // Available: Slate
    let emissiveColor = new THREE.Color('#475569');
    let emissiveIntensity = 0.05;

    if (isLocked) {
      targetColor.set('#7f1d1d'); // Locked: Deep Red
      emissiveColor.set('#b91c1c');
      emissiveIntensity = 0.1;
    } else if (isSelected) {
      targetColor.set('#1e40af'); // Selected: Premium Blue
      emissiveColor.set('#3b82f6');
      emissiveIntensity = 0.4;
    } else if (hovered) {
      targetColor.set('#1e293b'); // Hover: Darker Slate
      emissiveColor.set('#64748b');
      emissiveIntensity = 0.2;
    }

    const material = boxRef.current.material as THREE.MeshStandardMaterial;
    material.color.lerp(targetColor, delta * 5);
    material.emissive.lerp(emissiveColor, delta * 5);
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, emissiveIntensity, delta * 5);
  });

  const user = useStore((state) => state.user);
  const tempUserId = useStore((state) => state.tempUserId);
  const userId = user?.id || tempUserId;
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isLocked) return;

    if (isSelected) {
      setSelectedSlot(null);
      socketService.releaseSlot(lockId, userId);
      setStep('CHOOSE_TIME');
      return;
    }

    setSelectedSlot({ id: time, time, price });
    socketService.lockSlot(lockId, userId);
    setStep('CONFIRM');
  };

  return (
    <group position={position} ref={meshRef}>
      <Float speed={hovered && !isLocked ? 5 : 0} rotationIntensity={0} floatIntensity={0.2}>
        <mesh
          ref={boxRef}
          onClick={handleClick}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if(!isLocked) document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
          castShadow
        >
          <boxGeometry args={[2, 0.4, 1.2]} />
          <meshStandardMaterial
            transparent
            opacity={0.8}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Time Text */}
        <Text
          position={[0, 0.25, 0]}
          fontSize={0.4}
          color={isSelected ? "black" : "white"}
          rotation={[-Math.PI / 2, 0, 0]}
          anchorX="center"
          anchorY="middle"
        >
          {time}
        </Text>
        
        {/* Price Tag (Floating) */}
        {!isLocked && (
          <Text
            position={[0, 0.5, -0.8]}
            fontSize={0.2}
            color="#fbbf24"
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {price / 1000}k
          </Text>
        )}
      </Float>
    </group>
  );
};

export const Timeline3D: React.FC = () => {
  const currentStep = useStore((state) => state.currentStep);
  const selectedCourtId = useStore((state) => state.selectedCourtId);
  const courts = useStore((state) => state.courts);
  const realtimeLocks = useStore((state) => state.realtimeLocks);
  const bookings = useStore((state) => state.bookings);
  const selectedDate = useStore((state) => state.selectedDate);
  const setStep = useStore((state) => state.setStep);
  const selectedSlotId = useStore((state) => state.selectedSlot?.id);
  const setSelectedSlot = useStore((state) => state.setSelectedSlot);

  useEffect(() => {
    if (selectedCourtId && currentStep === 'SELECT_COURT') {
      const timer = setTimeout(() => {
        setStep('CHOOSE_TIME');
      }, 800); // Wait for camera to finish moving to court
      return () => clearTimeout(timer);
    }
  }, [selectedCourtId, currentStep, setStep]);

  useEffect(() => {
    if (currentStep === 'CHOOSE_TIME' && selectedSlotId) {
      setSelectedSlot(null);
    }
  }, [currentStep, selectedSlotId, setSelectedSlot]);

  if (!selectedCourtId || (currentStep !== 'SELECT_COURT' && currentStep !== 'CHOOSE_TIME' && currentStep !== 'CONFIRM')) {
    return null;
  }

  const court = courts.find(c => c.id === selectedCourtId);
  const allSlots = useStore((state) => state.slots);
  if (!court) return null;

  // Use slots from store or fallback to default if not loaded yet
  const displaySlots = allSlots.length > 0 ? allSlots : [
    { id: '1', time: '05:00 - 06:00', price: Math.round(court.price * 0.6) },
    { id: '2', time: '06:00 - 07:00', price: Math.round(court.price * 0.7) },
    { id: '3', time: '17:00 - 18:00', price: court.price },
    { id: '4', time: '18:00 - 19:00', price: Math.round(court.price * 1.2) },
    { id: '5', time: '19:00 - 20:00', price: Math.round(court.price * 1.2) },
  ];

  // Attach timeline to the right side of the court
  const [cx, cy, cz] = court.position;
  
  // Dynamic offset based on court type
  const spacingX = court.type === 'TENNIS' ? 10 : court.type === 'BADMINTON' ? 6 : 5;
  const offsetX = cx + spacingX; 
  const baseZ = cz - 4;

  return (
    <group position={[offsetX, 0, baseZ]}>
      {displaySlots.map((slot, index) => {
        const lockId = `${court.id}:${selectedDate}:${slot.time}`;
        const isBooked = bookings.some(b => 
          b.courtId === court.id && 
          b.slotTime === slot.time && 
          b.date === selectedDate &&
          b.status !== 'CANCELLED'
        );
        const isLocked = isBooked || !!realtimeLocks[lockId];

        return (
          <Slot
            key={lockId}
            id={lockId}
            time={slot.time}
            price={slot.price}
            position={[0, 0, index * 1.5]} // Layout along Z axis
            lockId={lockId}
            isLocked={isLocked}
          />
        );
      })}
      
      {/* Timeline Base/Track */}
      <mesh position={[0, -0.05, 3]} receiveShadow>
        <boxGeometry args={[2.2, 0.05, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    </group>
  );
};
