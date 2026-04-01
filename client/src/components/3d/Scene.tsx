import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Environment, useProgress, Html } from '@react-three/drei';
import { Lights } from './Lights';
import { Court } from './Court';
import { Zones3D } from './Zones3D';
import { QROrder3D } from './QROrder3D';
import { Timeline3D } from './Timeline3D';
import { CameraController } from './CameraController';
import { useStore } from '../../store/useStore';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import { socketService } from '../../services/socket.service';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';

RectAreaLightUniformsLib.init();

const Loader = () => {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="text-primary text-[10px] font-bold uppercase tracking-widest">
          Loading 3D Environment {Math.round(progress)}%
        </div>
      </div>
    </Html>
  )
}

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
  const courts = useStore((state) => state.courts);
  const controlsRef = React.useRef<any>(null);

  const lastEmitRef = React.useRef(0);

  const handlePointerMove = (e: any) => {
    if (e.point) {
      const now = Date.now();
      // Throttle to 100ms (10fps) to prevent flooding the server
      if (now - lastEmitRef.current > 100) {
        socketService.socket?.emit('CURSOR_MOVE', [e.point.x, e.point.y + 0.5, e.point.z]);
        lastEmitRef.current = now;
      }
    }
  };

  const enableDof = currentStep === 'CONFIRM';

  return (
    <Canvas
      camera={{ position: [0, 30, 38], fov: 62, near: 0.1, far: 500 }}
      style={{ height: '100vh', background: '#010409' }}
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
      <Suspense fallback={<Loader />}>
        <Lights />
        <PresenceLayer />
        
        <group position={[0, 0, 0]}>
          <Zones3D />
          <QROrder3D />
          {courts.map((court) => (
            <Court key={court.id} id={court.id} />
          ))}
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 75]}>
          <planeGeometry args={[72, 150]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        <Timeline3D />

        <Environment preset="city" />

        <EffectComposer enableNormalPass={false}>
          <DepthOfField focusDistance={0.02} focalLength={enableDof ? 0.015 : 0} bokehScale={enableDof ? 1.5 : 0} height={480} />
          <Bloom luminanceThreshold={1.8} luminanceSmoothing={0.6} height={300} intensity={0.25} />
          <Vignette eskil={false} offset={0.2} darkness={0.9} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};
