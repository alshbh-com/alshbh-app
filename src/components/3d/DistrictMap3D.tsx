import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Float, 
  MeshDistortMaterial,
  Sparkles,
  Stars,
  Html,
  PerspectiveCamera,
  Environment
} from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export interface District {
  id: string;
  name: string;
  restaurants_count?: number;
  position?: [number, number, number];
  color?: string;
  default_delivery_fee?: number;
  is_active?: boolean;
}

export interface Village {
  id: string;
  name: string;
  delivery_fee: number;
  position?: [number, number, number];
  district_id?: string;
  is_active?: boolean;
}

interface DistrictMap3DProps {
  districts: District[];
  selectedDistrict: District | null;
  villages: Village[];
  onSelectDistrict: (district: District) => void;
  onSelectVillage: (village: Village) => void;
}

// District 3D Landmark Component
function DistrictLandmark({ 
  district, 
  isSelected, 
  onClick 
}: { 
  district: District; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const pos = district.position || [0, 0, 0];
  const col = district.color || '#f97316';
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={district.position}>
        {/* Main landmark - Building shape */}
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          castShadow
        >
          <boxGeometry args={[1.5, 2.5, 1.5]} />
          <MeshDistortMaterial
            color={isSelected ? '#f97316' : district.color}
            emissive={hovered ? '#f97316' : '#000000'}
            emissiveIntensity={hovered ? 0.5 : 0}
            distort={0.2}
            speed={2}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        
        {/* Roof */}
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[1.2, 1, 4]} />
          <meshStandardMaterial 
            color={isSelected ? '#ea580c' : '#fbbf24'}
            emissive={hovered ? '#f97316' : '#000000'}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </mesh>
        
        {/* Neon glow ring */}
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.8, 0.1, 16, 32]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#f97316"
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Label */}
        <Html position={[0, 3.5, 0]} center distanceFactor={15}>
          <div 
            className={`px-4 py-2 rounded-xl text-center transition-all cursor-pointer ${
              isSelected 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                : 'bg-card/90 backdrop-blur-sm text-card-foreground'
            }`}
            onClick={onClick}
          >
            <p className="font-bold text-sm whitespace-nowrap">{district.name}</p>
            <p className="text-xs opacity-80">{district.restaurants_count} مطعم</p>
          </div>
        </Html>
        
        {/* Sparkles around landmark */}
        {(hovered || isSelected) && (
          <Sparkles
            count={30}
            size={3}
            speed={0.5}
            scale={4}
            color="#f97316"
          />
        )}
      </group>
    </Float>
  );
}

// Village Moon/Orb Component
function VillageMoon({
  village,
  index,
  onClick
}: {
  village: Village;
  index: number;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const angle = (index / 8) * Math.PI * 2;
  const radius = 5;
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Orbit animation
      meshRef.current.position.x = Math.cos(angle + time * 0.2) * radius;
      meshRef.current.position.z = Math.sin(angle + time * 0.2) * radius;
      meshRef.current.position.y = Math.sin(time * 2 + index) * 0.3 + 1;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.3} floatIntensity={1}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? '#f97316' : '#6366f1'}
          emissive={hovered ? '#f97316' : '#4f46e5'}
          emissiveIntensity={hovered ? 1 : 0.5}
          transparent
          opacity={0.9}
        />
        
        {/* Glow effect */}
        <mesh scale={1.3}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial
            color="#4f46e5"
            emissive="#4f46e5"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      </mesh>
      
      {/* Village info popup on hover */}
      {hovered && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-card/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-primary/30 animate-scale-in">
            <p className="font-bold text-sm whitespace-nowrap">{village.name}</p>
            <p className="text-xs text-primary font-bold">توصيل: {village.delivery_fee} ج.م</p>
          </div>
        </Html>
      )}
    </Float>
  );
}

// Camera Controller for zoom effects
function CameraController({ selectedDistrict }: { selectedDistrict: District | null }) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (selectedDistrict) {
      const target = new THREE.Vector3(...selectedDistrict.position);
      target.y += 5;
      target.z += 8;
      camera.position.lerp(target, 0.02);
      camera.lookAt(new THREE.Vector3(...selectedDistrict.position));
    } else {
      const defaultPos = new THREE.Vector3(0, 15, 20);
      camera.position.lerp(defaultPos, 0.02);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  });
  
  return null;
}

// Main 3D Scene
function Scene({ 
  districts, 
  selectedDistrict, 
  villages,
  onSelectDistrict, 
  onSelectVillage 
}: DistrictMap3DProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 15, 20]} fov={60} />
      <CameraController selectedDistrict={selectedDistrict} />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} color="#f97316" intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#6366f1" intensity={0.5} />
      
      {/* Environment */}
      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
      
      {/* Ground plane with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Grid lines */}
      <gridHelper args={[50, 50, '#4f46e5', '#1e1e3f']} position={[0, -0.99, 0]} />
      
      {/* Districts */}
      {districts.map((district) => (
        <DistrictLandmark
          key={district.id}
          district={district}
          isSelected={selectedDistrict?.id === district.id}
          onClick={() => onSelectDistrict(district)}
        />
      ))}
      
      {/* Villages (only show when district is selected) */}
      {selectedDistrict && villages.map((village, index) => (
        <VillageMoon
          key={village.id}
          village={village}
          index={index}
          onClick={() => onSelectVillage(village)}
        />
      ))}
      
      <OrbitControls 
        enablePan={false}
        minDistance={10}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

// Loading fallback
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-bold">جاري تحميل الخريطة...</p>
      </div>
    </Html>
  );
}

export function DistrictMap3D(props: DistrictMap3DProps) {
  return (
    <div className="w-full h-[70vh] rounded-3xl overflow-hidden bg-gradient-to-b from-background via-background to-primary/10">
      <Canvas shadows>
        <Suspense fallback={<Loader />}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
