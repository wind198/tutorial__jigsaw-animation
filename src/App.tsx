import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './game/config';

const ShapeLabScreen = lazy(() =>
  import('./screens/ShapeLabScreen').then((m) => ({ default: m.ShapeLabScreen })),
);

function GameApp() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    const game = new Phaser.Game(createGameConfig(parent));

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="game" ref={hostRef}  />;
}

function useShapeLabRoute(): boolean {
  const [lab, setLab] = useState(() => window.location.hash === '#shape-lab');

  useEffect(() => {
    const onHash = () => setLab(window.location.hash === '#shape-lab');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return lab;
}

export default function App() {
  const shapeLab = useShapeLabRoute();

  if (shapeLab) {
    return (
      <Suspense fallback={<div className="flex min-h-svh items-center justify-center">Loading…</div>}>
        <ShapeLabScreen />
      </Suspense>
    );
  }

  return <div className="h-screen w-screen"><GameApp /></div>;
}
