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

// Генерация объектов
import {generateTasks} from "./mock/task.js";
import {generateFilters} from "./mock/filter.js";

const TASK_COUNT = 30;
const SHOWING_TASKS_COUNT_ON_START = 8;
const SHOWING_TASKS_COUNT_BY_BUTTON = 8;

// Наименование (типа) пользовательского события проверки просрочки выполнения задачи
const CHECK_EXPIRE_EVENT = `checkExpire`;

const render = (container, text, place) => {
  container.insertAdjacentHTML(place, text);
};

const renderTask = (container, task, isEdit = false, place = `beforeend`) => {
  const text = isEdit ? createTaskEditTemplate(task) : createTaskTemplate(task);
  render(container, text, place);
  // Только что добавленной на страницу задаче навешивается обработчик пользовательского события "Проверка просрочки"
  taskListElement.lastChild.addEventListener(CHECK_EXPIRE_EVENT, function (evt) {
    if (task.isExpired && !evt.target.classList.contains(`card--deadline`)) {
      evt.target.classList.add(`card--deadline`);
    }
  });
};

const loadMoreButtonClickHandler = (evt) => {
  // Между моментом нажатия кнопки "Load more" и предыдущей отрисовкой задач может пройти какое-то время
  // За это время часть уже отрисованных задач может оказаться просроченной
  // Необходимо это проверить и, в случае просрочки, изменить отображение задачи
  // Для этого на уже отрисованных элементах запускам событие "Проверка просрочки"
  const timeEvent = new CustomEvent(CHECK_EXPIRE_EVENT);
  Array.from(taskListElement.children).forEach((item) => {
    item.dispatchEvent(timeEvent);
  });

  // Также необходимо обновить значения фильтров
  filters = generateFilters(tasks);
  const filterElement = siteMainElement.querySelector(`.filter`);
  render(filterElement, createFilterTemplate(filters), `afterend`);
  filterElement.remove();

  // Далее дорисовываем новые задачи
  const prevTasksCount = showingTasksCount;
  showingTasksCount += SHOWING_TASKS_COUNT_BY_BUTTON;

  filteredTasks.slice(prevTasksCount, showingTasksCount)
    .forEach((task) => renderTask(taskListElement, task));

  if (showingTasksCount >= filteredTasks.length) {
    evt.target.remove();
  }
};

const tasks = generateTasks(TASK_COUNT);
// На данный момент нет фильтрации
// Предполагаем, что фильтр по умолчанию стоит в значении All: все невыполненные задачи
const filteredTasks = tasks.filter((task) => !task.isArchive);

let filters = generateFilters(tasks);

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

render(siteHeaderElement, createSiteMenuTemplate(), `beforeend`);
render(siteMainElement, createFilterTemplate(filters), `beforeend`);
render(siteMainElement, createBoardTemplate(), `beforeend`);

const boardElement = siteMainElement.querySelector(`.board`);
render(boardElement, createSortingTemplate(), `afterbegin`);

const taskListElement = siteMainElement.querySelector(`.board__tasks`);
renderTask(taskListElement, filteredTasks[0], true);

let showingTasksCount = SHOWING_TASKS_COUNT_ON_START;
filteredTasks.slice(1, showingTasksCount)
  .forEach((task) => renderTask(taskListElement, task));

if (showingTasksCount < filteredTasks.length) {
  render(boardElement, createLoadMoreButtonTemplate(), `beforeend`);
  const loadMoreButton = boardElement.querySelector(`.load-more`);
  loadMoreButton.addEventListener(`click`, loadMoreButtonClickHandler);
}
