import { GameController } from 'src/controllers/GameController';

// Тут ініціалізується вся гра
window.addEventListener('DOMContentLoaded', async () => {
  const gameController = new GameController();
  await gameController.init();
});
