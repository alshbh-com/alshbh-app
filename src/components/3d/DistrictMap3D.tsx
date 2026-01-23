import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, OrbitControls, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface District {
  id: string;
  name: string;
  description: string | null;
  default_delivery_fee: number | null;
}

interface DistrictBuildingProps {
  district: District;
  position: [number, number, number];
  color: string;
  onClick: () => void;
  isSelected: boolean;
}

// Food-themed building for each district
const DistrictBuilding = ({ district, position, color, onClick, isSelected }: DistrictBuildingProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Rotate on hover
      if (hovered || isSelected) {
        meshRef.current.rotation.y += 0.02;
      }
    }
  });

  const scale = hovered || isSelected ? 1.2 : 1;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position}>
        {/* Main building - Cylinder (like a pot/bowl) */}
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={scale}
        >
          <cylinderGeometry args={[0.8, 1, 1.2, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={hovered || isSelected ? color : '#000000'}
            emissiveIntensity={hovered || isSelected ? 0.5 : 0}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>

        {/* Lid on top */}
        <mesh position={[0, 0.8, 0]} scale={scale}>
          <sphereGeometry args={[0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={color}
            emissive={hovered || isSelected ? color : '#000000'}
            emissiveIntensity={hovered || isSelected ? 0.3 : 0}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Neon ring when selected/hovered */}
        {(hovered || isSelected) && (
          <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.3, 0.05, 16, 32]} />
            <meshBasicMaterial color="#ff6b00" transparent opacity={0.8} />
          </mesh>
        )}

        {/* Floating delivery fee bubble */}
        {district.default_delivery_fee && (hovered || isSelected) && (
          <Float speed={3} floatIntensity={0.5}>
            <mesh position={[1.5, 0.5, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
            </mesh>
          </Float>
        )}
      </group>
    </Float>
  );
};

// Floating cloud/island decoration
const FloatingIsland = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#fef3c7" transparent opacity={0.6} />
    </mesh>
  );
};

// Delivery scooter animation
const DeliveryScooter = () => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * 0.3;
      ref.current.position.x = Math.sin(t) * 5;
      ref.current.position.z = Math.cos(t) * 5;
      ref.current.rotation.y = -t + Math.PI / 2;
    }
  });

  return (
    <group ref={ref} position={[0, 0.2, 5]}>
      <mesh>
        <boxGeometry args={[0.3, 0.2, 0.5]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} />
      </mesh>
      {/* Wheels */}
      <mesh position={[0, -0.1, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, -0.1, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
};

// Ground plane
const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial 
        color="#2d1810" 
        transparent 
        opacity={0.3}
      />
    </mesh>
  );
};

interface DistrictMap3DProps {
  districts: District[];
  onDistrictSelect: (district: District) => void;
  selectedDistrictId?: string;
}

// Position calculator for districts in a circle
const getDistrictPosition = (index: number, total: number): [number, number, number] => {
  if (total === 1) return [0, 0, 0];
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 3;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
};

// Color palette based on Egyptian food
const foodColors = [
  '#d97706', // Falafel/طعمية - golden brown
  '#dc2626', // Tomato/طماطم - red
  '#65a30d', // Herbs/أعشاب - green
  '#92400e', // Koshari/كشري - brown
  '#f59e0b', // Fool/فول - yellow
  '#c2410c', // Spices/توابل - deep orange
];

const Scene = ({ districts, onDistrictSelect, selectedDistrictId }: DistrictMap3DProps) => {
  return (
    <>
      {/* Ambient and directional lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff6b00" />
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#22c55e" />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

      {/* Environment */}
      <Environment preset="night" />

      {/* Ground */}
      <Ground />

      {/* District buildings */}
      {districts.map((district, index) => (
        <DistrictBuilding
          key={district.id}
          district={district}
          position={getDistrictPosition(index, districts.length)}
          color={foodColors[index % foodColors.length]}
          onClick={() => onDistrictSelect(district)}
          isSelected={selectedDistrictId === district.id}
        />
      ))}

      {/* Floating decorative islands */}
      <FloatingIsland position={[-4, 2, -2]} />
      <FloatingIsland position={[4, 1.5, 2]} />
      <FloatingIsland position={[0, 2.5, -4]} />
      <FloatingIsland position={[3, 1, -3]} />

      {/* Delivery scooter animation */}
      <DeliveryScooter />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={5}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Loading fallback
const LoadingFallback = () => (
  <mesh>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshBasicMaterial color="#f97316" wireframe />
  </mesh>
);

const DistrictMap3D = ({ districts, onDistrictSelect, selectedDistrictId }: DistrictMap3DProps) => {
  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas
        camera={{ position: [0, 6, 10], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            districts={districts}
            onDistrictSelect={onDistrictSelect}
            selectedDistrictId={selectedDistrictId}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default DistrictMap3D;
