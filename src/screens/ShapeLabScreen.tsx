import { CopyIcon, RotateCcwIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEFAULT_SHAPE } from '@/features/jigsaw/config/puzzle-config';
import { buildEdgeProfile } from '@/features/jigsaw/geometry/edge-profile';
import { generatePuzzleGeometry } from '@/features/jigsaw/geometry/jigsaw-generator';
import { outlineToSvgPath } from '@/features/jigsaw/geometry/svg-path';
import type { ShapeParams } from '@/features/jigsaw/geometry/types';

const PARAM_META: {
  key: keyof ShapeParams;
  label: string;
  description: string;
}[] = [
  { key: 'tabWidthRatio', label: 'Tab width', description: 'How much of the edge the knob occupies (ref piece ≈ 0.96).' },
  { key: 'tabDepthRatio', label: 'Tab depth', description: 'Bulge size vs edge length (ref piece ≈ 0.72).' },
  { key: 'neckWidthRatio', label: 'Neck width', description: 'Distance from peak to neck (wider = neck closer to edge ends).' },
  { key: 'neckDepthRatio', label: 'Neck depth', description: 'How shallow the neck is vs peak.' },
  { key: 'bulbWidthRatio', label: 'Shoulder width', description: 'How far out the entry flare sits before the neck.' },
  { key: 'bulbDepthRatio', label: 'Bulb / flare', description: 'Shoulder flare at tab entry/exit.' },
  { key: 'shapeVariation', label: 'Shape variation', description: 'Random spread when variation ≠ 0.5.' },
];

const VARIATION = 0.5;

function formatShapeExport(shape: ShapeParams): string {
  return JSON.stringify(shape, null, 2);
}

function EdgeSvg({
  segments,
  viewBox,
  stroke,
  className,
}: {
  segments: ReturnType<typeof buildEdgeProfile>;
  viewBox: string;
  stroke: string;
  className?: string;
}) {
  const d = outlineToSvgPath(segments);
  return (
    <svg viewBox={viewBox} className={className} aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function ShapeLabScreen() {
  const [shape, setShape] = useState<ShapeParams>({ ...DEFAULT_SHAPE });
  const [copyHint, setCopyHint] = useState('');

  const horizontal = useMemo(
    () => buildEdgeProfile({ x: 0, y: 0 }, { x: 100, y: 0 }, 1, shape, VARIATION),
    [shape],
  );
  const vertical = useMemo(
    () => buildEdgeProfile({ x: 0, y: 0 }, { x: 0, y: 100 }, 1, shape, VARIATION),
    [shape],
  );

  const centerPiece = useMemo(() => {
    const g = generatePuzzleGeometry({
      rows: 3,
      cols: 3,
      boardWidth: 300,
      boardHeight: 300,
      seed: 2026,
      shape,
      rendering: { padding: 4, outlineWidth: 2.5 },
    });
    return g.pieces.find((p) => p.row === 1 && p.col === 1)!;
  }, [shape]);

  const setParam = (key: keyof ShapeParams, value: number) => {
    setShape((prev) => ({ ...prev, [key]: value }));
  };

  const copyConfig = async () => {
    await navigator.clipboard.writeText(formatShapeExport(shape));
    setCopyHint('Copied JSON');
    window.setTimeout(() => setCopyHint(''), 2000);
  };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-lg font-medium">Jigsaw cut shape lab</h1>
          <p className="text-sm text-muted-foreground">
            Tune <code className="text-xs">ShapeParams</code> — variation fixed at 0.5 for preview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window.location.hash = '';
            }}
          >
            Back to game
          </Button>
          <Button variant="outline" onClick={() => setShape({ ...DEFAULT_SHAPE })}>
            <RotateCcwIcon data-icon="inline-start" />
            Reset
          </Button>
          <Button onClick={() => void copyConfig()}>
            <CopyIcon data-icon="inline-start" />
            Copy JSON
          </Button>
          {copyHint ? <Badge variant="secondary">{copyHint}</Badge> : null}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:items-start">
        <Card className="w-full shrink-0 lg:max-w-md">
          <CardHeader>
            <CardTitle>Knobs</CardTitle>
            <CardDescription>Paste copied JSON into DEFAULT_SHAPE in puzzle-config.ts</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[min(70vh,640px)] pr-3">
              <FieldGroup>
                {PARAM_META.map(({ key, label, description }) => (
                  <Field key={key}>
                    <FieldLabel htmlFor={key}>
                      {label}{' '}
                      <span className="font-mono text-muted-foreground">{shape[key].toFixed(3)}</span>
                    </FieldLabel>
                    <Slider
                      id={key}
                      min={0}
                      max={1}
                      step={0.005}
                      value={[shape[key]]}
                      onValueChange={(v) => {
                        const next = Array.isArray(v) ? v[0] : v;
                        if (typeof next === 'number') setParam(key, next);
                      }}
                    />
                    <FieldDescription>{description}</FieldDescription>
                  </Field>
                ))}
              </FieldGroup>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-2">
            <Separator />
            <Field>
              <FieldLabel htmlFor="export">Export</FieldLabel>
              <Input id="export" readOnly value={formatShapeExport(shape)} className="font-mono text-xs" />
            </Field>
          </CardFooter>
        </Card>

        <Card className="min-w-0 flex-1">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Generated paths (compare with tests/jigsaw/fixtures/edges)</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="horizontal">
              <TabsList>
                <TabsTrigger value="horizontal">Horizontal edge</TabsTrigger>
                <TabsTrigger value="vertical">Vertical edge</TabsTrigger>
                <TabsTrigger value="piece">Center piece</TabsTrigger>
                <TabsTrigger value="reference">Reference piece</TabsTrigger>
              </TabsList>
              <TabsContent value="horizontal" className="flex flex-col gap-3 pt-2">
                <EdgeSvg
                  segments={horizontal}
                  viewBox="-95 -8 200 95"
                  stroke="var(--foreground)"
                  className="h-auto w-full max-w-2xl rounded-lg border bg-muted/30"
                />
                <p className="font-mono text-xs text-muted-foreground break-all">{outlineToSvgPath(horizontal)}</p>
              </TabsContent>
              <TabsContent value="vertical" className="flex flex-col gap-3 pt-2">
                <EdgeSvg
                  segments={vertical}
                  viewBox="-95 -8 108 200"
                  stroke="var(--foreground)"
                  className="h-auto w-full max-w-md rounded-lg border bg-muted/30"
                />
                <p className="font-mono text-xs text-muted-foreground break-all">{outlineToSvgPath(vertical)}</p>
              </TabsContent>
              <TabsContent value="piece" className="pt-2">
                <svg
                  viewBox={`${centerPiece.bounds.x - 8} ${centerPiece.bounds.y - 8} ${centerPiece.bounds.width + 16} ${centerPiece.bounds.height + 16}`}
                  className="mx-auto h-auto w-full max-w-lg rounded-lg border bg-muted/30"
                  aria-hidden
                >
                  <path
                    d={outlineToSvgPath(centerPiece.outline, true)}
                    fill="color-mix(in oklch, var(--primary) 12%, transparent)"
                    stroke="var(--foreground)"
                    strokeWidth={1.5}
                  />
                </svg>
              </TabsContent>
              <TabsContent value="reference" className="flex flex-col gap-3 pt-2">
                <p className="text-sm text-muted-foreground">
                  Gold piece SVG (fixtures/edges/reference-piece-tab.svg). Tune knobs until center piece
                  matches this silhouette.
                </p>
                <img
                  src="/reference-piece-tab.svg"
                  alt="Reference jigsaw piece"
                  className="mx-auto w-full max-w-md rounded-lg border bg-muted/30"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
