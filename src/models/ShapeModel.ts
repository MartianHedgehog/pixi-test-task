import { Bounds, IShape, Rectangle, ShapeType } from 'src/types';

export class Shape implements IShape {
  public readonly id: string;
  public x: number;
  public y: number;
  public readonly type: ShapeType;
  public readonly color: number;
  public readonly size: number;
  public rotation: number;
  public readonly rotationSpeed: number;
  public area: number;
  public bounceCount: number;
  public readonly maxBounces: number;

  // Map with functions for each shape type
  private static readonly areaCalculators = new Map<ShapeType, (size: number) => number>([
    [ShapeType.TRIANGLE, (size) => (Math.sqrt(3) / 4) * size * size],
    [ShapeType.SQUARE, (size) => size * size],
    [ShapeType.PENTAGON, (size) => (1.25 * size * size) / Math.tan(Math.PI / 5)],
    [
      ShapeType.HEXAGON,
      (size) => {
        const radius = size / 2;
        return ((3 * Math.sqrt(3)) / 2) * Math.pow(radius, 2);
      },
    ],
    [
      ShapeType.CIRCLE,
      (size) => {
        const radius = size / 2;
        return Math.PI * radius * radius;
      },
    ],
    [
      ShapeType.ELLIPSE,
      (size) => {
        const radius = size / 2;
        return Math.PI * radius * (radius * 0.67);
      },
    ],
    [ShapeType.RANDOM_COMPLEX, (size) => size * size * 0.7],
  ]);

  constructor(x: number, y: number, type: ShapeType, color: number, size: number = 100) {
    this.id = this.generateId();
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.size = size;
    this.bounceCount = 0;
    this.maxBounces = 3 + Math.floor(Math.random() * 3);
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.area = 0;
    this.calculateArea();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  // Simple and elegant area calculation
  public calculateArea(): void {
    const calculator = Shape.areaCalculators.get(this.type);

    if (calculator) {
      this.area = calculator(this.size);
    } else {
      // Fallback for unknown types
      this.area = this.size * this.size;
    }
  }

  public update(gravity: number, bounds: Bounds): boolean {
    this.y += gravity;

    // Collision with walls
    if (this.x - this.size / 2 <= 0 || this.x + this.size / 2 >= bounds.width) {
      this.x = Math.max(this.size / 2, Math.min(bounds.width - this.size / 2, this.x));
      this.bounceCount++;
    }

    return this.y < bounds.height + this.size && this.bounceCount < this.maxBounces;
  }

  public getBounds(): Rectangle {
    return {
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      width: this.size,
      height: this.size,
    };
  }

  public checkCollision(other: IShape): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (this.size + other.size) / 2;

    if (distance < minDistance && distance > 0) {
      // Simple elastic collision
      const angle = Math.atan2(dy, dx);
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      // Separate shapes
      const overlap = minDistance - distance;
      this.x += cos * overlap * 0.5;
      this.y += sin * overlap * 0.5;
      other.x -= cos * overlap * 0.5;
      other.y -= sin * overlap * 0.5;

      return true;
    }
    return false;
  }
}
