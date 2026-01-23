import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  Sparkles,
  Stars,
  Html,
  PerspectiveCamera,
  Trail
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface OrderCelebration3DProps {
  isVisible: boolean;
  orderNumber: number;
  villageName?: string;
  onComplete: () => void;
}

// Confetti Particle
function Confetti({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.1,
    Math.random() * 0.1 + 0.05,
    (Math.random() - 0.5) * 0.1
  ));
  const rotationSpeed = useRef(new THREE.Vector3(
    Math.random() * 0.1,
    Math.random() * 0.1,
    Math.random() * 0.1
  ));

  useFrame(() => {
    if (meshRef.current) {
      velocity.current.y -= 0.002; // Gravity
      meshRef.current.position.add(velocity.current);
      meshRef.current.rotation.x += rotationSpeed.current.x;
      meshRef.current.rotation.y += rotationSpeed.current.y;
      meshRef.current.rotation.z += rotationSpeed.current.z;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.2, 0.2, 0.02]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

// Delivery Guy
function DeliveryGuy({ villageName }: { villageName?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState(new THREE.Vector3(0, 1, 5));
  const targetPosition = new THREE.Vector3(0, 1, -10);

  useFrame((state) => {
    if (groupRef.current) {
      // Move towards target
      position.lerp(targetPosition, 0.01);
      groupRef.current.position.copy(position);
      
      // Wobble animation
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1;
      groupRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
    }
  });

  return (
    <Trail
      width={2}
      length={8}
      color="#f97316"
      attenuation={(t) => t * t}
    >
      <group ref={groupRef} position={[0, 1, 5]}>
        {/* Motorcycle body */}
        <mesh>
          <boxGeometry args={[1, 0.5, 2]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        
        {/* Wheels */}
        {[-0.6, 0.6].map((z, i) => (
          <mesh key={i} position={[0, -0.3, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
        
        {/* Delivery box */}
        <mesh position={[0, 0.6, -0.3]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        
        {/* Rider */}
        <mesh position={[0, 0.8, 0.3]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        
        {/* Label */}
        <Html position={[0, 2, 0]} center>
          <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
            <p className="font-bold text-sm whitespace-nowrap">
              🛵 في الطريق إلى {villageName || 'عنوانك'}
            </p>
          </div>
        </Html>
      </group>
    </Trail>
  );
}

// Main Celebration Scene
function CelebrationScene({ orderNumber, villageName, onComplete }: Omit<OrderCelebration3DProps, 'isVisible'>) {
  const [confettiParticles, setConfettiParticles] = useState<Array<{
    id: number;
    position: [number, number, number];
    color: string;
  }>>([]);

  useEffect(() => {
    // Generate confetti
    const particles = [];
    const colors = ['#f97316', '#22c55e', '#6366f1', '#ec4899', '#fbbf24'];
    for (let i = 0; i < 100; i++) {
      particles.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 10,
          Math.random() * 5 + 3,
          (Math.random() - 0.5) * 10
        ] as [number, number, number],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setConfettiParticles(particles);

    // Auto complete after animation
    const timer = setTimeout(onComplete, 6000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={50} />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 10, 0]} color="#f97316" intensity={2} />
      <pointLight position={[-5, 5, 5]} color="#22c55e" intensity={1} />
      <pointLight position={[5, 5, 5]} color="#6366f1" intensity={1} />
      
      <Stars radius={50} depth={50} count={1000} factor={4} fade speed={2} />
      
      {/* Confetti */}
      {confettiParticles.map((particle) => (
        <Confetti
          key={particle.id}
          position={particle.position}
          color={particle.color}
        />
      ))}
      
      {/* Sparkles */}
      <Sparkles count={100} size={6} speed={0.5} scale={20} color="#f97316" />
      <Sparkles count={100} size={4} speed={0.3} scale={15} color="#22c55e" />
      
      {/* Order success message */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
        <Html position={[0, 4, 0]} center>
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 0.5,
                repeat: 3
              }}
              className="text-7xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold text-primary drop-shadow-[0_0_20px_hsl(var(--primary))]">
              تم تأكيد طلبك!
            </h2>
            <p className="text-xl mt-2 text-foreground">
              رقم الطلب: <span className="text-primary font-bold">#{orderNumber}</span>
            </p>
          </motion.div>
        </Html>
      </Float>
      
      {/* Delivery guy animation */}
      <DeliveryGuy villageName={villageName} />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          transparent 
          opacity={0.5}
        />
      </mesh>
    </>
  );
}

export function OrderCelebration3D({ 
  isVisible, 
  orderNumber, 
  villageName,
  onComplete 
}: OrderCelebration3DProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        >
          <Canvas>
            <Suspense fallback={null}>
              <CelebrationScene 
                orderNumber={orderNumber}
                villageName={villageName}
                onComplete={onComplete}
              />
            </Suspense>
          </Canvas>
          
          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            onClick={onComplete}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-card px-6 py-3 rounded-full shadow-lg"
          >
            تخطي
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
