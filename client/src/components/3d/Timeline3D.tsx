import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../../store/useStore'
import * as THREE from 'three'
import { Text, Float } from '@react-three/drei'
import { socketService } from '../../services/socket.service'

interface SlotProps {
  id: string;
  time: string;
  position: [number, number, number];
  isLocked: boolean;
  price: number;
  lockId: string;
  selectedSlot: any;
  setStep: (step: any) => void;
  setSelectedSlot: (slot: any) => void;
  userId: string;
  slot: any;
}

const Slot: React.FC<SlotProps> = ({ 
  id, 
  time, 
  position, 
  isLocked, 
  price, 
  lockId, 
  selectedSlot, 
  setStep, 
  setSelectedSlot, 
  userId, 
  slot 
}) => {
  const meshRef = useRef<THREE.Group>(null!);
  const boxRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedSlot?.id === slot.id || selectedSlot?.id === time;
  
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

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    if (isLocked) return;

    if (isSelected) {
      setSelectedSlot(null);
      socketService.releaseSlot(lockId, userId);
      setStep('CHOOSE_TIME');
      return;
    }

    setSelectedSlot({ id: slot.id, time, price });
    socketService.lockSlot(lockId, userId);
    setStep('CONFIRM');
  }, [isLocked, isSelected, setSelectedSlot, lockId, userId, setStep, time, price, slot]);

  return (
    <group position={position} ref={meshRef}>
      <Float speed={hovered && !isLocked ? 5 : 0} rotationIntensity={0} floatIntensity={0.2}>
        <mesh
          ref={boxRef}
          onClick={handleClick}
          onPointerOver={useCallback((e: any) => { 
            e.stopPropagation(); 
            setHovered(true); 
            if(!isLocked) document.body.style.cursor = 'pointer'; 
          }, [isLocked])}
          onPointerOut={useCallback((e: any) => { 
            e.stopPropagation(); 
            setHovered(false); 
            document.body.style.cursor = 'auto'; 
          }, [])}
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

const SLOTS_PER_PAGE = 5;

export const Timeline3D: React.FC = () => {
  // Call ALL hooks at the TOP, BEFORE ANY conditionals or early returns!
  const currentStep = useStore((state) => state.currentStep);
  const selectedCourtId = useStore((state) => state.selectedCourtId);
  const courts = useStore((state) => state.courts);
  const realtimeLocks = useStore((state) => state.realtimeLocks);
  const bookings = useStore((state) => state.bookings);
  const selectedDate = useStore((state) => state.selectedDate);
  const setStep = useStore((state) => state.setStep);
  const selectedSlot = useStore((state) => state.selectedSlot);
  const setSelectedSlot = useStore((state) => state.setSelectedSlot);
  const user = useStore((state) => state.user);
  const tempUserId = useStore((state) => state.tempUserId);
  const allSlots = useStore((state) => state.slots);

  const [currentPage, setCurrentPage] = useState(0);

  // Derive court first (even if null)
  const court = useMemo(() => courts.find(c => c.id === selectedCourtId), [courts, selectedCourtId]);
  
  // Derive userId first
  const userId = useMemo(() => user?.id || tempUserId, [user, tempUserId]);
  
  // Derive displaySlots first (even if court is null - use dummy price)
  const displaySlots = useMemo(() => allSlots.length > 0 ? allSlots : [
    { id: '1', time: '05:00 - 06:00', price: Math.round((court?.price || 150000) * 0.6) },
    { id: '2', time: '06:00 - 07:00', price: Math.round((court?.price || 150000) * 0.7) },
    { id: '3', time: '17:00 - 18:00', price: court?.price || 150000 },
    { id: '4', time: '18:00 - 19:00', price: Math.round((court?.price || 150000) * 1.2) },
    { id: '5', time: '19:00 - 20:00', price: Math.round((court?.price || 150000) * 1.2) },
  ], [allSlots, court?.price]);

  // Paginate slots
  const totalPages = Math.ceil(displaySlots.length / SLOTS_PER_PAGE);
  const paginatedSlots = useMemo(() => {
    const start = currentPage * SLOTS_PER_PAGE;
    return displaySlots.slice(start, start + SLOTS_PER_PAGE);
  }, [displaySlots, currentPage]);

  useEffect(() => {
    if (selectedCourtId && currentStep === 'SELECT_COURT') {
      const timer = setTimeout(() => {
        setStep('CHOOSE_TIME');
      }, 800); // Wait for camera to finish moving to court
      return () => clearTimeout(timer);
    }
  }, [selectedCourtId, currentStep, setStep]);

  useEffect(() => {
    if (currentStep === 'CHOOSE_TIME' && selectedSlot) {
      setSelectedSlot(null);
    }
  }, [currentStep, selectedSlot, setSelectedSlot]);

  // Now check if we should render nothing
  if (!selectedCourtId || !court || (currentStep !== 'SELECT_COURT' && currentStep !== 'CHOOSE_TIME' && currentStep !== 'CONFIRM')) {
    return null;
  }

  // Attach timeline to the right side of the court
  const [cx, cy, cz] = court.position;
  
  // Dynamic offset based on court type
  const spacingX = court.type === 'TENNIS' ? 10 : court.type === 'BADMINTON' ? 6 : 5;
  const offsetX = cx + spacingX; 
  const baseZ = cz - 4;
  const trackLength = (SLOTS_PER_PAGE - 1) * 1.5 + 1.5;

  return (
    <group position={[offsetX, 0, baseZ]}>
      {paginatedSlots.map((slot, index) => {
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
            selectedSlot={selectedSlot}
            setStep={setStep}
            setSelectedSlot={setSelectedSlot}
            userId={userId}
            slot={slot}
          />
        );
      })}
      
      {/* Timeline Base/Track */}
      <mesh position={[0, -0.05, (trackLength / 2) - 0.75]} receiveShadow>
        <boxGeometry args={[2.2, 0.05, trackLength]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Page Navigation Buttons */}
      {totalPages > 1 && (
        <>
          {/* Previous Button */}
          {currentPage > 0 && (
            <mesh
              position={[0, 0.5, -1.5]}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(p => Math.max(0, p - 1));
              }}
              onPointerOver={() => document.body.style.cursor = 'pointer'}
              onPointerOut={() => document.body.style.cursor = 'auto'}
            >
              <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
              <meshStandardMaterial color="#3b82f6" />
              <Text position={[0, 0.1, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">◀</Text>
            </mesh>
          )}

          {/* Next Button */}
          {currentPage < totalPages - 1 && (
            <mesh
              position={[0, 0.5, trackLength + 0.75]}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(p => Math.min(totalPages - 1, p + 1));
              }}
              onPointerOver={() => document.body.style.cursor = 'pointer'}
              onPointerOut={() => document.body.style.cursor = 'auto'}
            >
              <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
              <meshStandardMaterial color="#3b82f6" />
              <Text position={[0, 0.1, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">▶</Text>
            </mesh>
          )}

          {/* Page Indicator */}
          <Text
            position={[0, 0.8, trackLength / 2 - 0.75]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {currentPage + 1}/{totalPages}
          </Text>
        </>
      )}
    </group>
  );
};
