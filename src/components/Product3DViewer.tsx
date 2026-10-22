import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Play, Pause, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';

interface Product3DViewerProps {
  modelType?: 'phone' | 'sneaker' | 'produce' | 'bottle' | 'furniture';
  productName: string;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({
  modelType = 'phone',
  productName,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(true);
  const isRotatingRef = useRef(true);
  isRotatingRef.current = isRotating;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Clean neutral background
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch {
      setLoading(false);
      return;
    }

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffeedd, 1.0);
    dirLight2.position.set(-5, -2, -3);
    scene.add(dirLight2);

    const rimLight = new THREE.PointLight(0xff3366, 0.8, 10);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // 5. Ground pedestal shadow receiver
    const pedestalGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.08, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.6,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.1;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Subtle ring accent
    const ringGeo = new THREE.RingGeometry(1.6, 1.7, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.05;
    scene.add(ring);

    // 6. Build procedural 3D model according to type
    const productGroup = new THREE.Group();
    groupRef.current = productGroup;

    if (modelType === 'phone') {
      // Sleek Titan Smartphone
      const bodyGeo = new THREE.BoxGeometry(1.2, 2.3, 0.12);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.2,
      });
      const body = new THREE.Mesh(bodyGeo, frameMat);
      body.castShadow = true;
      productGroup.add(body);

      // Screen Glass
      const screenGeo = new THREE.PlaneGeometry(1.14, 2.22);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.4,
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.065;
      productGroup.add(screen);

      // Camera Bump
      const bumpGeo = new THREE.BoxGeometry(0.5, 0.6, 0.06);
      const bumpMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 });
      const bump = new THREE.Mesh(bumpGeo, bumpMat);
      bump.position.set(-0.28, 0.75, -0.07);
      productGroup.add(bump);

      // Three Lenses
      for (let i = 0; i < 3; i++) {
        const lensGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 24);
        const lensMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.1 });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(-0.28, 0.9 - i * 0.18, -0.1);
        productGroup.add(lens);
      }
    } else if (modelType === 'bottle') {
      // Prestige Spirits Decanter
      const bottleGeo = new THREE.CylinderGeometry(0.55, 0.7, 1.8, 32);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xb45309,
        transmission: 0.85,
        opacity: 1,
        transparent: true,
        roughness: 0.05,
        ior: 1.5,
      });
      const bottle = new THREE.Mesh(bottleGeo, glassMat);
      bottle.castShadow = true;
      productGroup.add(bottle);

      // Neck & Stopper
      const neckGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 24);
      const neck = new THREE.Mesh(neckGeo, glassMat);
      neck.position.y = 1.15;
      productGroup.add(neck);

      const stopperGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.3, 24);
      const stopperMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
      const stopper = new THREE.Mesh(stopperGeo, stopperMat);
      stopper.position.y = 1.55;
      productGroup.add(stopper);
    } else if (modelType === 'sneaker') {
      // Contemporary Urban Sneaker
      const soleGeo = new THREE.BoxGeometry(1.1, 0.3, 2.2);
      const soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const sole = new THREE.Mesh(soleGeo, soleMat);
      sole.position.y = -0.4;
      sole.castShadow = true;
      productGroup.add(sole);

      const upperGeo = new THREE.BoxGeometry(0.95, 0.65, 1.8);
      const upperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
      const upper = new THREE.Mesh(upperGeo, upperMat);
      upper.position.set(0, 0.05, -0.1);
      upper.castShadow = true;
      productGroup.add(upper);

      const collarGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.5, 20);
      const collarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.position.set(0, 0.5, -0.4);
      productGroup.add(collar);
    } else if (modelType === 'furniture') {
      // Office Ergonomic Chair
      const seatGeo = new THREE.BoxGeometry(1.2, 0.15, 1.1);
      const meshMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const seat = new THREE.Mesh(seatGeo, meshMat);
      seat.castShadow = true;
      productGroup.add(seat);

      const backGeo = new THREE.BoxGeometry(1.1, 1.4, 0.1);
      const back = new THREE.Mesh(backGeo, meshMat);
      back.position.set(0, 0.75, -0.5);
      back.rotation.x = -0.1;
      back.castShadow = true;
      productGroup.add(back);

      const basePoleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 16);
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const basePole = new THREE.Mesh(basePoleGeo, chromeMat);
      basePole.position.y = -0.5;
      productGroup.add(basePole);
    } else {
      // Agricultural Crate & Produce Sacks
      const crateGeo = new THREE.BoxGeometry(1.5, 0.8, 1.3);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 });
      const crate = new THREE.Mesh(crateGeo, woodMat);
      crate.castShadow = true;
      productGroup.add(crate);

      // Produce spheres inside
      for (let x = -0.4; x <= 0.4; x += 0.4) {
        for (let z = -0.3; z <= 0.3; z += 0.3) {
          const fruitGeo = new THREE.SphereGeometry(0.2, 16, 16);
          const fruitMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
          const fruit = new THREE.Mesh(fruitGeo, fruitMat);
          fruit.position.set(x, 0.45, z);
          productGroup.add(fruit);
        }
      }
    }

    scene.add(productGroup);
    setLoading(false);

    // 7. Interactive Mouse / Touch Dragging
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !productGroup) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      productGroup.rotation.y += deltaX * 0.01;
      productGroup.rotation.x = Math.max(-0.6, Math.min(0.6, productGroup.rotation.x + deltaY * 0.01));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvasEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 8. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isRotatingRef.current && !isDragging && productGroup) {
        productGroup.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      canvasEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelType]);

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const newZ = cameraRef.current.position.z + delta;
    if (newZ >= 2.5 && newZ <= 6.5) {
      cameraRef.current.position.z = newZ;
    }
  };

  const handleReset = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 1.8, 4.2);
      cameraRef.current.lookAt(0, 0, 0);
    }
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
    setIsRotating(true);
  };

  return (
    <div className="relative w-full h-[380px] md:h-[450px] bg-gradient-to-b from-neutral-50 to-neutral-100 rounded-2xl overflow-hidden border border-neutral-200 shadow-inner select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Banner Information */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-medium text-neutral-800 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        <span>Vue 3D Interactive 360° : {productName}</span>
      </div>

      <div className="absolute top-3 right-3 z-10 text-[11px] font-medium text-neutral-500 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-200">
        Faites glisser pour tourner
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-neutral-300 border-t-red-600 rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-neutral-600">Chargement du modèle 3D...</span>
          </div>
        </div>
      )}

      {/* Bottom Floating Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg border border-neutral-700">
        <button
          type="button"
          onClick={() => setIsRotating((prev) => !prev)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium hover:text-red-400 transition-colors"
          title={isRotating ? 'Mettre en pause la rotation' : 'Reprendre la rotation'}
        >
          {isRotating ? <Pause className="w-3.5 h-3.5 text-red-400" /> : <Play className="w-3.5 h-3.5 text-green-400" />}
          <span>{isRotating ? 'Pause' : 'Tourner'}</span>
        </button>

        <div className="w-px h-3.5 bg-neutral-700" />

        <button
          type="button"
          onClick={() => handleZoom(-0.5)}
          className="p-1 hover:text-red-400 transition-colors"
          title="Zoom avant"
          aria-label="Zoom avant"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(0.5)}
          className="p-1 hover:text-red-400 transition-colors"
          title="Zoom arrière"
          aria-label="Zoom arrière"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-neutral-700" />

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 p-1 hover:text-red-400 transition-colors text-xs"
          title="Réinitialiser la vue"
          aria-label="Réinitialiser la vue"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Centrer</span>
        </button>
      </div>
    </div>
  );
};
