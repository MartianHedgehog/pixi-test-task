import * as PIXI from 'pixi.js';
import { GameModel } from 'src/models/GameModel';
import { IGameController, IGameModel, IShapeView, IUIView } from 'src/types';
import { ShapeView } from 'src/views/ShapeView';
import { UIView } from 'src/views/UIVIew';

export class GameController implements IGameController {
  private model: IGameModel;
  private app: PIXI.Application | null = null;
  private shapeView: IShapeView | null = null;
  private uiView: IUIView;

  constructor() {
    this.model = new GameModel();
    this.uiView = new UIView();
  }

  public async init(): Promise<void> {
    try {
      await this.setupPixi();
      this.shapeView = new ShapeView(this.app!.stage);
      this.setupEventListeners();

      this.uiView.updateControls(this.model.spawnRate, this.model.gravity);

      this.app!.ticker.add(this.gameUpdate, this);
      this.app!.ticker.maxFPS = 60;
    } catch (error) {
      console.error('Failed to initialize game:', error);
      throw error;
    }
  }

  private async setupPixi(): Promise<void> {
    this.app = new PIXI.Application();

    await this.app.init({
      width: 800,
      height: 600,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    });

    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) {
      throw new Error('Game canvas element not found');
    }

    gameCanvas.appendChild(this.app.canvas);

    this.app.stage.interactive = true;
    this.app.stage.hitArea = new PIXI.Rectangle(0, 0, 800, 600);
  }

  private gameUpdate = (ticker: PIXI.Ticker): void => {
    if (!this.shapeView) return;

    // Use PIXI deltaTime instead of performance.now()
    const deltaTime = ticker.deltaTime;

    this.model.update(deltaTime);
    this.shapeView.render(this.model.shapes);
    this.uiView.updateInfo(this.model.getShapeCount(), this.model.getTotalSurfaceArea());
  };

  private changeColorOfSameType(clickedShape: any): void {
    const shapeType = clickedShape.type;

    // Get all shapes of the same type (except the clicked one)
    this.model.shapes.forEach((shape) => {
      if (shape.type === shapeType && shape.id !== clickedShape.id) {
        shape.color = this.generateRandomColor();
      }
    });

    // Force immediate redraw
    if (this.shapeView) {
      this.shapeView.render(this.model.shapes);
    }
  }

  private generateRandomColor(): number {
    return Math.floor(Math.random() * 0xffffff);
  }

  private setupEventListeners(): void {
    if (!this.app) return;

    // Canvas click events
    this.app.stage.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      const pos = event.global;
      const clickedShape = this.model.getShapeAt(pos.x, pos.y);

      if (clickedShape) {
        this.changeColorOfSameType(clickedShape);
        this.model.removeShape(clickedShape.id);
      } else {
        this.model.addShape(pos.x, pos.y);
      }
    });

    // Control buttons
    this.setupControlButton('increaseSpawn', () => {
      this.model.setSpawnRate(this.model.spawnRate + 1);
      this.uiView.updateControls(this.model.spawnRate, this.model.gravity);
    });

    this.setupControlButton('decreaseSpawn', () => {
      this.model.setSpawnRate(this.model.spawnRate - 1);
      this.uiView.updateControls(this.model.spawnRate, this.model.gravity);
    });

    this.setupControlButton('increaseGravity', () => {
      const increment = this.model.gravity < 1.0 ? 0.1 : 1.0;
      this.model.setGravity(this.model.gravity + increment);
      this.uiView.updateControls(this.model.spawnRate, this.model.gravity);
    });

    this.setupControlButton('decreaseGravity', () => {
      const decrement = this.model.gravity > 1.0 ? 1.0 : 0.1;
      this.model.setGravity(this.model.gravity - decrement);
      this.uiView.updateControls(this.model.spawnRate, this.model.gravity);
    });
  }

  private setupControlButton(elementId: string, callback: () => void): void {
    const element = this.uiView.getElement(elementId);
    if (element) {
      element.addEventListener('click', callback);
    }
  }
}
