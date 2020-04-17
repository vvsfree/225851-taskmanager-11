import BoardComponent from "./components/board.js";
import BoardController from "./controllers/board.js";
import FilterComponent from "./components/filter.js";
import SiteMenuComponent from "./components/site-menu.js";

// Генерация объектов
import {generateTasks} from "./mock/task.js";
import {generateFilters} from "./mock/filter.js";

// Отрисовка элементов
import {render, RenderPosition} from "./utils/render.js";

const TASK_COUNT = 20;

const tasks = generateTasks(TASK_COUNT);
// На данный момент фильтрация не реализована
// Предполагаем, что фильтр по умолчанию стоит в значении All: все невыполненные задачи
const filteredTasks = tasks.filter((task) => !task.isArchive);

let filters = generateFilters(tasks);

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

render(siteHeaderElement, new SiteMenuComponent(), RenderPosition.BEFOREEND);
render(siteMainElement, new FilterComponent(filters), RenderPosition.BEFOREEND);

const boardComponent = new BoardComponent();
const boardController = new BoardController(boardComponent);

render(siteMainElement, boardComponent, RenderPosition.BEFOREEND);
boardController.render(filteredTasks);
