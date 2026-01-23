import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface Village {
  id: string;
  name: string;
  delivery_fee: number;
  district_id: string | null;
}

interface VillageBubbleProps {
  village: Village;
  index: number;
  total: number;
  onClick: () => void;
  isSelected: boolean;
}

// Village as floating food bubble orbiting around center
const VillageBubble = ({ village, index, total, onClick, isSelected }: VillageBubbleProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const bubbleRef = useRef<THREE.Mesh>(null);
  
  const angle = (index / total) * Math.PI * 2;
  const radius = 2.5;
  const baseX = Math.cos(angle) * radius;
  const baseZ = Math.sin(angle) * radius;

  useFrame((state) => {
    if (meshRef.current) {
      // Orbit animation
      const speed = 0.2;
      const currentAngle = angle + state.clock.elapsedTime * speed;
      meshRef.current.position.x = Math.cos(currentAngle) * radius;
      meshRef.current.position.z = Math.sin(currentAngle) * radius;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + index) * 0.3;
    }
    
    if (bubbleRef.current && isSelected) {
      bubbleRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  // Color based on delivery fee (cheaper = greener)
  const feeColor = village.delivery_fee <= 20 
    ? '#22c55e' 
    : village.delivery_fee <= 40 
      ? '#f59e0b' 
      : '#f97316';

  return (
    <Float speed={2} floatIntensity={0.3}>
      <group ref={meshRef} position={[baseX, 0.5, baseZ]}>
        {/* Main bubble - falafel/food shape */}
        <mesh
          ref={bubbleRef}
          onClick={onClick}
          scale={isSelected ? 1.2 : 1}
        >
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color={isSelected ? '#f97316' : '#b45309'}
            emissive={isSelected ? '#f97316' : '#000000'}
            emissiveIntensity={isSelected ? 0.5 : 0}
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>

        {/* Delivery fee floating bubble */}
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color={feeColor}
            emissive={feeColor}
            emissiveIntensity={0.4}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Selection ring */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
            <torusGeometry args={[0.5, 0.03, 16, 32]} />
            <meshBasicMaterial color="#f97316" />
          </mesh>
        )}
      </group>
    </Float>
  );
};

// Center district representation
const CenterDistrict = ({ districtName }: { districtName: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={1} floatIntensity={0.2}>
      <group position={[0, 0, 0]}>
        {/* Main pot/tagine shape */}
        <mesh ref={meshRef}>
          <cylinderGeometry args={[0.6, 0.8, 0.8, 32]} />
          <meshStandardMaterial
            color="#d97706"
            emissive="#f97316"
            emissiveIntensity={0.3}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        
        {/* Lid */}
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.5, 0.6, 32]} />
          <meshStandardMaterial
            color="#b45309"
            emissive="#f97316"
            emissiveIntensity={0.2}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* Base glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
          <torusGeometry args={[1, 0.05, 16, 64]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.6} />
        </mesh>
      </group>
    </Float>
  );
};

interface VillageOrbit3DProps {
  districtName: string;
  villages: Village[];
  onVillageSelect: (village: Village) => void;
  selectedVillageId?: string;
}

const Scene = ({ districtName, villages, onVillageSelect, selectedVillageId }: VillageOrbit3DProps) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={1} color="#f97316" />
      <pointLight position={[5, 3, 5]} intensity={0.5} color="#22c55e" />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#f59e0b" />

      {/* Stars background */}
      <Stars radius={50} depth={30} count={500} factor={3} saturation={0} fade speed={1} />

      {/* Environment */}
      <Environment preset="night" />

      {/* Center district */}
      <CenterDistrict districtName={districtName} />

      {/* Village bubbles orbiting */}
      {villages.map((village, index) => (
        <VillageBubble
          key={village.id}
          village={village}
          index={index}
          total={villages.length}
          onClick={() => onVillageSelect(village)}
          isSelected={selectedVillageId === village.id}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={4}
        maxDistance={10}
      />
    </>
  );
};

const LoadingFallback = () => (
  <mesh>
    <torusGeometry args={[1, 0.3, 16, 32]} />
    <meshBasicMaterial color="#f97316" wireframe />
  </mesh>
);

const VillageOrbit3D = ({ districtName, villages, onVillageSelect, selectedVillageId }: VillageOrbit3DProps) => {
  return (
    <div className="w-full h-[350px] md:h-[400px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas
        camera={{ position: [0, 4, 6], fov: 50 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            districtName={districtName}
            villages={villages}
            onVillageSelect={onVillageSelect}
            selectedVillageId={selectedVillageId}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default VillageOrbit3D;
