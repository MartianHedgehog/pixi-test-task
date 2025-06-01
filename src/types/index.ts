export enum ShapeType {
  TRIANGLE = 0,
  SQUARE = 1,
  PENTAGON = 2,
  HEXAGON = 3,
  CIRCLE = 4,
  ELLIPSE = 5,
  RANDOM_COMPLEX = 6,
}

export interface Bounds {
  width: number;
  height: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IShape {
  id: string;
  x: number;
  y: number;
  type: ShapeType;
  color: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  area: number;
  bounceCount: number;
  maxBounces: number;

  update(gravity: number, bounds: Bounds): boolean;
  getBounds(): Rectangle;
  checkCollision(other: IShape): boolean;
  calculateArea(): void;
}

export interface IGameModel {
  shapes: IShape[];
  gravity: number;
  spawnRate: number;
  bounds: Bounds;
  totalSurfaceArea: number;

  addShape(x: number, y: number, type?: ShapeType | null): IShape;
  removeShape(shapeId: string): boolean;
  update(deltaTime: number): void;
  getShapeAt(x: number, y: number): IShape | null;
  setSpawnRate(rate: number): void;
  setGravity(gravity: number): void;
  getShapeCount(): number;
  getTotalSurfaceArea(): number;
}

export interface IShapeView {
  render(shapes: IShape[]): void;
  destroy(): void;
}

export interface IUIView {
  updateInfo(shapeCount: number, surfaceArea: number): void;
  updateControls(spawnRate: number, gravity: number): void;
  getElement(id: string): HTMLElement | null;
}

export interface IGameController {
  init(): Promise<void>;
}
