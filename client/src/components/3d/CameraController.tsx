import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';

export const CameraController = ({ controlsRef }: { controlsRef: React.MutableRefObject<any> }) => {
  const currentStep = useStore((state) => state.currentStep);
  const viewMode = useStore((state) => state.viewMode);
  const selectedCourtId = useStore((state) => state.selectedCourtId);
  const courts = useStore((state) => state.courts);

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

  const clampToDome = (pos: THREE.Vector3) => {
    const minX = -32
    const maxX = 32
    const minZ = 0
    const maxZ = 150
    const minY = 2
    const maxY = 48

    pos.x = clamp(pos.x, minX, maxX)
    pos.z = clamp(pos.z, minZ, maxZ)
    pos.y = clamp(pos.y, minY, maxY)

    const cx = 0
    const cy = 15
    const r = 40
    const dx = pos.x - cx
    const dy = pos.y - cy
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d > r) {
      const s = r / d
      pos.x = cx + dx * s
      pos.y = cy + dy * s
    }
  }

  const enforceBounds = () => {
    const controls = controlsRef.current
    if (!controls) return

    const pos = new THREE.Vector3()
    const target = new THREE.Vector3()

    if (typeof controls.getPosition === 'function') controls.getPosition(pos)
    else if (controls.camera?.position) pos.copy(controls.camera.position)

    if (typeof controls.getTarget === 'function') controls.getTarget(target)
    else if (typeof controls.getTargetPosition === 'function') controls.getTargetPosition(target)

    const beforePos = pos.clone()
    const beforeTarget = target.clone()

    clampToDome(pos)
    target.x = clamp(target.x, -32, 32)
    target.z = clamp(target.z, 0, 150)
    target.y = clamp(target.y, 0, 10)

    const moved = beforePos.distanceToSquared(pos) > 1e-6 || beforeTarget.distanceToSquared(target) > 1e-6
    if (moved) {
      controls.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z, false)
    }
  }

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const onUpdate = () => enforceBounds()
    controls.addEventListener?.('update', onUpdate)
    return () => controls.removeEventListener?.('update', onUpdate)
  }, [controlsRef])

  useEffect(() => {
    const controls = controlsRef.current
    const camera = controls?.camera
    if (!camera) return
    const targetFov = viewMode === 'OVERVIEW' && currentStep === 'EXPLORE' ? 62 : viewMode === 'OVERVIEW' ? 52 : 60
    if (camera.fov !== targetFov) {
      camera.fov = targetFov
      camera.updateProjectionMatrix()
    }
  }, [controlsRef, currentStep, viewMode])

  // Cinematic initial load
  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current?.setLookAt(0, 42, 25, 0, 0, 75, true);
  }, []);

  const lastTarget = useRef<{ pos: [number, number, number]; look: [number, number, number] } | null>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    let targetPos: [number, number, number] = [0, 42, 25];
    let targetLookAt: [number, number, number] = [0, 0, 75];

    const selectedCourt = courts.find(c => c.id === selectedCourtId);

    // HUMAN VIEW MODE (Walkthrough at 1.7m)
    if (viewMode === 'HUMAN') {
      if (selectedCourt) {
        const [cx, cy, cz] = selectedCourt.position;
        targetPos = [cx, 1.7, cz - 15];
        targetLookAt = [cx, 1.7, cz];
      } else {
        targetPos = [0, 1.7, 8];
        targetLookAt = [0, 1.7, 50];
      }
    } else {
      // OVERVIEW MODE
      switch (currentStep) {
        case 'EXPLORE':
          targetPos = [0, 42, 25];
          targetLookAt = [0, 0, 75];
          break;
        case 'SELECT_COURT': {
          if (selectedCourt) {
            const [cx, cy, cz] = selectedCourt.position;
            // Quay về hướng màn hình (side view for better reading)
            targetPos = [cx + 15, 12, cz];
            targetLookAt = [cx, 0, cz];
          }
          break;
        }
        case 'CHOOSE_TIME':
        case 'CONFIRM': {
          if (selectedCourt) {
            const [cx, cy, cz] = selectedCourt.position;
            // Close side view for details
            targetPos = [cx + 12, 6, cz];
            targetLookAt = [cx, 0, cz];
          }
          break;
        }
      }
    }

    // Only update if target has actually changed to prevent resetting during user interaction
    const isNewTarget = !lastTarget.current || 
      lastTarget.current.pos.some((v, i) => v !== targetPos[i]) ||
      lastTarget.current.look.some((v, i) => v !== targetLookAt[i]);

    if (isNewTarget) {
      lastTarget.current = { pos: targetPos, look: targetLookAt };
      controlsRef.current.setLookAt(
        targetPos[0], targetPos[1], targetPos[2],
        targetLookAt[0], targetLookAt[1], targetLookAt[2],
        true
      );
    }
    enforceBounds();
  }, [currentStep, viewMode, selectedCourtId, controlsRef]); // Removed 'courts' from deps

  return null;
};
