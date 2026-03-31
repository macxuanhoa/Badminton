import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Environment, Float, MeshReflectorMaterial, ContactShadows } from '@react-three/drei';
import { Lights } from './Lights';
import { Court } from './Court';
import { Zones3D } from './Zones3D';
import { QROrder3D } from './QROrder3D';
import { Timeline3D } from './Timeline3D';
import { CameraController } from './CameraController';
import { useStore } from '../../store/useStore';
import { EffectComposer, Bloom, Noise, Vignette, DepthOfField } from '@react-three/postprocessing';
import { socketService } from '../../services/socket.service';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';

RectAreaLightUniformsLib.init();

const PresenceLayer = () => {
  const otherUsersPresence = useStore((state) => state.otherUsersPresence);
  
  return (
    <group>
      {Object.entries(otherUsersPresence).map(([userId, position]) => (
        <mesh key={userId} position={position}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.6} />
          <pointLight color="#ff00ff" intensity={0.5} distance={2} />
        </mesh>
      ))}
    </group>
  );
};

export const Scene: React.FC = () => {
  const currentStep = useStore((state) => state.currentStep);
  const selectedCourtId = useStore((state) => state.selectedCourtId);
  const courts = useStore((state) => state.courts);
  const controlsRef = React.useRef<any>(null);

  const handlePointerMove = (e: any) => {
    if (e.point) {
      socketService.socket?.emit('CURSOR_MOVE', [e.point.x, e.point.y + 0.5, e.point.z]);
    }
  };

  const isSelecting = currentStep !== 'EXPLORE';
  const enableDof = currentStep === 'CONFIRM';

  return (
    <Canvas
      shadows
      camera={{ position: [0, 30, 38], fov: 62, near: 0.1, far: 500 }}
      style={{ minHeight: '100vh', background: '#010409' }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
      onPointerMove={handlePointerMove}
    >
      <CameraControls
        ref={controlsRef}
        makeDefault
        minDistance={6}
        maxDistance={85}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={Math.PI / 10}
        smoothTime={0.4}
        draggingSmoothTime={0.1}
      />
      <CameraController controlsRef={controlsRef} />
      <Suspense fallback={null}>
        <Lights />
        <PresenceLayer />
        
        <group position={[0, 0, 0]}>
          <Zones3D />
          <QROrder3D />
          {courts.map((court) => (
            <Float speed={isSelecting && selectedCourtId !== court.id ? 0 : 2} rotationIntensity={0.05} floatIntensity={0.2} key={court.id}>
              <Court id={court.id} />
            </Float>
          ))}
        </group>

        <ContactShadows 
          opacity={0.8} 
          scale={200} 
          blur={2} 
          far={15} 
          resolution={1024} 
          color="#000000" 
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 75]} receiveShadow>
          <planeGeometry args={[72, 150]} />
          <MeshReflectorMaterial
            blur={[400, 200]}
            resolution={512}
            mixBlur={1}
            mixStrength={20}
            mirror={0.6}
            roughness={0.2}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#050505"
            metalness={0.8}
          />
        </mesh>

        <Timeline3D />

        <Environment preset="city" />

        <EffectComposer enableNormalPass={false}>
          <DepthOfField focusDistance={0.02} focalLength={enableDof ? 0.015 : 0} bokehScale={enableDof ? 1.5 : 0} height={480} />
          <Bloom luminanceThreshold={1.8} luminanceSmoothing={0.6} height={300} intensity={0.25} />
          <Noise opacity={0.015} />
          <Vignette eskil={false} offset={0.2} darkness={0.9} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};
