import LoadMoreButtonComponent from "../components/load-more-button.js";
import TasksComponent from "../components/tasks.js";
import NoTasksComponent from "../components/no-tasks.js";
import SortComponent, {SortType} from "../components/sort.js";

import {render, remove, RenderPosition} from "../utils/render.js";

import TaskController from "./task.js";

const SHOWING_TASKS_COUNT_ON_START = 8;
const SHOWING_TASKS_COUNT_BY_BUTTON = 8;

const renderTasks = (taskListElement, tasks, onDataChange, onViewChange) => {
  return tasks.map((task) => {
    const taskController = new TaskController(taskListElement, onDataChange, onViewChange);

    taskController.render(task);

    return taskController;
  });
};

const getSortedTasks = (tasks, sortType) => {
  let sortedTasks = [];
  const showingTasks = tasks.slice();

  switch (sortType) {
    case SortType.DATE_UP:
      sortedTasks = showingTasks.sort((a, b) => a.dueDate - b.dueDate);
      break;
    case SortType.DATE_DOWN:
      sortedTasks = showingTasks.sort((a, b) => b.dueDate - a.dueDate);
      break;
    case SortType.DEFAULT:
      sortedTasks = showingTasks;
      break;
  }

  return sortedTasks;
};

export default class BoardController {
  constructor(container) {
    this._container = container;

    this._tasks = [];
    this._showedTaskControllers = [];

    this._showingTasksCount = SHOWING_TASKS_COUNT_ON_START;
    this._noTasksComponent = new NoTasksComponent();
    this._sortComponent = new SortComponent();
    this._tasksComponent = new TasksComponent();
    this._loadMoreButtonComponent = new LoadMoreButtonComponent();

    this._onDataChange = this._onDataChange.bind(this);
    this._onViewChange = this._onViewChange.bind(this);

    this._onSortTypeChange = this._onSortTypeChange.bind(this);
    this._sortComponent.setSortTypeChangeHandler(this._onSortTypeChange);

  }

  render(tasks) {
    this._tasks = tasks;

    const containerElement = this._container.getElement();

    if (tasks.length === 0) {
      render(containerElement, this._noTasksComponent, RenderPosition.BEFOREEND);
      return;
    }

    render(containerElement, this._sortComponent, RenderPosition.BEFOREEND);
    render(containerElement, this._tasksComponent, RenderPosition.BEFOREEND);

    const taskListElement = this._tasksComponent.getElement();
    const newTaskControllers = renderTasks(taskListElement, this._tasks.slice(0, this._showingTasksCount), this._onDataChange, this._onViewChange);
    this._showedTaskControllers = this._showedTaskControllers.concat(newTaskControllers);

    this._renderLoadMoreButton(tasks);
  }

  _renderLoadMoreButton(source) {
    // Если отрисовывается кнопка, которая уже есть на странице, то она не продублируется, но добавится еще один обработчик
    // Поэтому удаляем ее полностью (не только из DOM, но и сам элемент, к которому привязывается обработчик)
    if (this._loadMoreButtonComponent.isElementExists()) {
      remove(this._loadMoreButtonComponent);
    }

    // Не показываем кнопку, если не хватает элементов для дополнительной подгрузки
    if (this._showingTasksCount >= source.length) {
      return;
    }

    const containerElement = this._container.getElement();
    render(containerElement, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

    this._loadMoreButtonComponent.setClickHandler(() => {
      const prevTasksCount = this._showingTasksCount;
      const taskListElement = this._tasksComponent.getElement();
      this._showingTasksCount += SHOWING_TASKS_COUNT_BY_BUTTON;

      const newTaskControllers = renderTasks(taskListElement, source.slice(prevTasksCount, this._showingTasksCount), this._onDataChange, this._onViewChange);
      this._showedTaskControllers = this._showedTaskControllers.concat(newTaskControllers);

      if (this._showingTasksCount >= source.length) {
        remove(this._loadMoreButtonComponent);
      }
    });
  }

  _onDataChange(taskController, oldData, newData) {
    const index = this._tasks.findIndex((it) => it === oldData);

    if (index === -1) {
      return;
    }

    this._tasks = [].concat(this._tasks.slice(0, index), newData, this._tasks.slice(index + 1));

    taskController.render(this._tasks[index]);
  }

  _onViewChange() {
    this._showedTaskControllers.forEach((it) => it.setDefaultView());
  }

  _onSortTypeChange(sortType) {
    this._showingTasksCount = SHOWING_TASKS_COUNT_ON_START;

    const sortedTasks = getSortedTasks(this._tasks, sortType);
    const taskListElement = this._tasksComponent.getElement();

    taskListElement.innerHTML = ``;

    const newTaskControllers = renderTasks(taskListElement, sortedTasks.slice(0, this._showingTasksCount), this._onDataChange, this._onViewChange);
    this._showedTaskControllers = newTaskControllers;

    this._renderLoadMoreButton(sortedTasks);
  }
}
