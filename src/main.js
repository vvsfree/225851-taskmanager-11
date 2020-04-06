// Меню
import {createSiteMenuTemplate} from "./components/site-menu.js";
// Фильтры
import {createFilterTemplate} from "./components/filter.js";
// Панель задач
import {createBoardTemplate} from "./components/board.js";
// Управляющие сортировкой элементы
import {createSortingTemplate} from "./components/sorting.js";
// Карточка задачи
import {createTaskTemplate} from "./components/task.js";
// Форма создания/редактирования задачи (используется одна форма)
import {createTaskEditTemplate} from "./components/task-edit.js";
// Кнопка «Load more».
import {createLoadMoreButtonTemplate} from "./components/load-more-button.js";

const TASK_COUNT = 3;

const render = (container, text, place) => {
  container.insertAdjacentHTML(place, text);
};

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

render(siteHeaderElement, createSiteMenuTemplate(), `beforeend`);
render(siteMainElement, createFilterTemplate(), `beforeend`);
render(siteMainElement, createBoardTemplate(), `beforeend`);

const boardElement = siteMainElement.querySelector(`.board`);
render(boardElement, createSortingTemplate(), `afterbegin`);

const taskListElement = siteMainElement.querySelector(`.board__tasks`);
render(taskListElement, createTaskEditTemplate(), `beforeend`);

for (let i = 0; i < TASK_COUNT; i++) {
  render(taskListElement, createTaskTemplate(), `beforeend`);
}

render(boardElement, createLoadMoreButtonTemplate(), `beforeend`);
