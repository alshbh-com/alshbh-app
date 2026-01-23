import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  Text, 
  Html,
  MeshDistortMaterial,
  Sparkles,
  PerspectiveCamera,
  OrbitControls
} from '@react-three/drei';
import * as THREE from 'three';

interface Restaurant {
  id: string;
  name: string;
  image_url?: string;
  rating: number;
  is_open: boolean;
}

interface RestaurantStorefront3DProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

// Single Restaurant Storefront
function Storefront({
  restaurant,
  position,
  onClick
}: {
  restaurant: Restaurant;
  position: [number, number, number];
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (groupRef.current && hovered) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={groupRef}
        position={position}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Main building */}
        <mesh castShadow>
          <boxGeometry args={[2, 2.5, 1.5]} />
          <meshStandardMaterial
            color={restaurant.is_open ? '#22c55e' : '#ef4444'}
            metalness={0.2}
            roughness={0.5}
          />
        </mesh>
        
        {/* Roof/Awning */}
        <mesh position={[0, 1.5, 0.5]}>
          <boxGeometry args={[2.4, 0.3, 0.8]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#f97316"
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </mesh>
        
        {/* Door */}
        <mesh position={[0, -0.5, 0.76]}>
          <boxGeometry args={[0.8, 1.4, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        
        {/* Windows */}
        {[-0.6, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 0.5, 0.76]}>
            <boxGeometry args={[0.4, 0.5, 0.05]} />
            <meshStandardMaterial
              color="#93c5fd"
              emissive="#60a5fa"
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
        
        {/* Neon sign frame */}
        <mesh position={[0, 2.2, 0.8]}>
          <boxGeometry args={[1.8, 0.5, 0.1]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#f97316"
            emissiveIntensity={hovered ? 1 : 0.5}
          />
        </mesh>
        
        {/* Info popup */}
        <Html position={[0, 3.5, 0]} center distanceFactor={8}>
          <div
            className={`px-4 py-3 rounded-2xl text-center transition-all cursor-pointer min-w-[140px] ${
              hovered
                ? 'bg-primary text-primary-foreground shadow-xl scale-110'
                : 'bg-card/90 backdrop-blur-sm text-card-foreground shadow-soft'
            }`}
          >
            <p className="font-bold text-sm">{restaurant.name}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-xs">{restaurant.rating}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                restaurant.is_open 
                  ? 'bg-green-500/20 text-green-600' 
                  : 'bg-red-500/20 text-red-600'
              }`}>
                {restaurant.is_open ? 'مفتوح' : 'مغلق'}
              </span>
            </div>
          </div>
        </Html>
        
        {/* Sparkles on hover */}
        {hovered && (
          <Sparkles
            count={20}
            size={2}
            speed={0.5}
            scale={3}
            color="#f97316"
          />
        )}
      </group>
    </Float>
  );
}

function Scene({ restaurants, onSelectRestaurant }: RestaurantStorefront3DProps) {
  // Calculate positions in a grid
  const getPosition = (index: number): [number, number, number] => {
    const cols = 3;
    const spacing = 4;
    const row = Math.floor(index / cols);
    const col = index % cols;
    return [
      (col - (cols - 1) / 2) * spacing,
      0,
      -row * spacing
    ];
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, 5]} color="#f97316" intensity={0.5} />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Grid */}
      <gridHelper args={[30, 30, '#4f46e5', '#1e1e3f']} position={[0, -1.49, 0]} />
      
      {/* Restaurants */}
      {restaurants.map((restaurant, index) => (
        <Storefront
          key={restaurant.id}
          restaurant={restaurant}
          position={getPosition(index)}
          onClick={() => onSelectRestaurant(restaurant)}
        />
      ))}
      
      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}

export function RestaurantStorefront3D(props: RestaurantStorefront3DProps) {
  return (
    <div className="w-full h-[50vh] rounded-3xl overflow-hidden bg-gradient-to-b from-background to-primary/5">
      <Canvas shadows>
        <Suspense fallback={
          <Html center>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </Html>
        }>
          <Scene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
