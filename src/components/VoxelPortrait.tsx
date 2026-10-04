import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { MotionValue } from "motion/react";
import { LOGO_CELLS, LOGO_H, LOGO_W } from "../lib/logo";

const FOV = 32;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInCubic = (t: number) => t * t * t;

// Deterministic PRNG so the scatter looks the same on every visit.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Voxel = {
  tx: number; ty: number; tz: number;       // resting position
  sx: number; sy: number; sz: number;       // scattered start
  ex: number; ey: number; ez: number;       // explode direction
  rx: number; ry: number; spin: number;     // tumble
  delay: number; glint: boolean;
};

function buildVoxels(): Voxel[] {
  const rnd = mulberry32(20240809);
  return LOGO_CELLS.map(({ r, c, glint }) => {
    const tx = c - LOGO_W / 2 + 0.5;
    const ty = -(r - LOGO_H / 2 + 0.5);
    const theta = rnd() * Math.PI * 2;
    const phi = Math.acos(2 * rnd() - 1);
    const rad = 60 + rnd() * 70;
    const len = Math.hypot(tx, ty) || 1;
    const spread = 0.6 + rnd() * 0.9;
    return {
      tx, ty, tz: (rnd() - 0.5) * 0.5,
      sx: rad * Math.sin(phi) * Math.cos(theta),
      sy: rad * Math.sin(phi) * Math.sin(theta),
      sz: rad * Math.cos(phi) - 30,
      ex: (tx / len) * spread + (rnd() - 0.5) * 0.8,
      ey: (ty / len) * spread + (rnd() - 0.5) * 0.8,
      ez: 0.4 + rnd() * 1.4,
      rx: rnd() - 0.5, ry: rnd() - 0.5, spin: 4 + rnd() * 8,
      delay: (r / LOGO_H) * 0.7 + rnd() * 0.5,
      glint,
    };
  });
}

/** Studio-style reflections without downloading an HDR. */
function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

function Voxels({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const body = useRef<THREE.InstancedMesh>(null!);
  const shine = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);
  const voxels = useMemo(buildVoxels, []);
  const plain = useMemo(() => voxels.filter(v => !v.glint), [voxels]);
  const glints = useMemo(() => voxels.filter(v => v.glint), [voxels]);
  const geometry = useMemo(() => new RoundedBoxGeometry(0.9, 0.9, 0.9, 2, 0.1), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const born = useRef<number | null>(null);
  const { camera, size } = useThree();

  // Fit the portrait into the top half: ~38% of the viewport height (less on
  // phones, where the copy wraps), never wider than ~62% of the width.
  useEffect(() => {
    const aspect = size.width / size.height;
    const compact = aspect < 0.8 || size.height < 680;
    const needH = Math.max(LOGO_H / (compact ? 0.3 : 0.38), (LOGO_W / 0.62) / aspect);
    camera.position.set(0, 0, needH / (2 * TAN));
    camera.updateProjectionMatrix();
    group.current.position.y = needH * (compact ? 0.24 : 0.18);
  }, [camera, size]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (born.current === null) born.current = t;
    const since = t - born.current;
    const p = progress.get();
    const explode = reduced ? 0 : easeInCubic(clamp01((p - 0.16) / 0.62));
    const k = Math.min(1, delta * 3.5);

    const yaw = reduced ? 0 : state.pointer.x * 0.35 + Math.sin(t * 0.35) * 0.06 + p * 1.25;
    const pitch = reduced ? 0 : -state.pointer.y * 0.16 + p * 0.3;
    group.current.rotation.y += (yaw - group.current.rotation.y) * k;
    group.current.rotation.x += (pitch - group.current.rotation.x) * k;

    const place = (mesh: THREE.InstancedMesh, list: Voxel[]) => {
      for (let i = 0; i < list.length; i++) {
        const v = list[i];
        const e = reduced ? 1 : easeOutExpo(clamp01((since - v.delay) / 1.5));
        const wave = reduced ? 0 : Math.sin(t * 1.4 - (v.tx * 0.16 + v.ty * 0.11)) * 0.35 * e * (1 - explode);
        const fly = explode * 95;
        dummy.position.set(
          v.sx + (v.tx - v.sx) * e + v.ex * fly,
          v.sy + (v.ty - v.sy) * e + v.ey * fly,
          v.sz + (v.tz - v.sz) * e + wave + v.ez * fly,
        );
        const tumble = (1 - e) * v.spin + explode * v.spin;
        dummy.rotation.set(v.rx * tumble, v.ry * tumble, 0);
        dummy.scale.setScalar((0.25 + 0.75 * e) * (1 - explode * 0.55));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    place(body.current, plain);
    place(shine.current, glints);
  });

  return (
    <group ref={group}>
      <instancedMesh ref={body} args={[geometry, undefined, plain.length]} frustumCulled={false}>
        <meshStandardMaterial color="#f4f4f4" roughness={0.3} metalness={0.08} envMapIntensity={0.7} />
      </instancedMesh>
      <instancedMesh ref={shine} args={[geometry, undefined, glints.length]} frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.6} />
      </instancedMesh>
    </group>
  );
}

export default function VoxelPortrait({ progress, active, reduced }: { progress: MotionValue<number>; active: boolean; reduced: boolean }) {
  return (
    <Canvas
      className="voxel-canvas"
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: FOV, near: 1, far: 2000, position: [0, 0, 200] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Studio />
      <ambientLight intensity={0.25} />
      <directionalLight position={[30, 50, 80]} intensity={2.2} />
      <directionalLight position={[-60, -20, -40]} intensity={0.7} />
      <Voxels progress={progress} reduced={reduced} />
    </Canvas>
  );
}
