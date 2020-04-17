import LoadMoreButtonComponent from "../components/load-more-button.js";
import TaskEditComponent from "../components/task-edit.js";
import TaskComponent from "../components/task.js";
import TasksComponent from "../components/tasks.js";
import NoTasksComponent from "../components/no-tasks.js";
import SortComponent, {SortType} from "../components/sort.js";

import {render, replace, remove, RenderPosition} from "../utils/render.js";

const SHOWING_TASKS_COUNT_ON_START = 8;
const SHOWING_TASKS_COUNT_BY_BUTTON = 8;

const renderTask = (taskListElement, task) => {
  const replaceTaskToEdit = () => {
    replace(taskEditComponent, taskComponent);
  };

  const replaceEditToTask = () => {
    replace(taskComponent, taskEditComponent);
  };

  // Обработчик события нажатия клавиши Escape
  const onEscKeyDown = (evt) => {
    const isEscKey = evt.key === `Escape` || evt.key === `Esc`;

    if (isEscKey) {
      replaceEditToTask();
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };

  const taskComponent = new TaskComponent(task);
  const taskEditComponent = new TaskEditComponent(task);

  taskComponent.setEditButtonClickHandler(() => {
    replaceTaskToEdit();
    document.addEventListener(`keydown`, onEscKeyDown);
  });

  taskEditComponent.setSubmitHandler((evt) => {
    evt.preventDefault();
    replaceEditToTask();
    document.removeEventListener(`keydown`, onEscKeyDown);
  });

  render(taskListElement, taskComponent, RenderPosition.BEFOREEND);
};

const renderTasks = (taskListElement, tasks) => {
  tasks.forEach((task) => {
    renderTask(taskListElement, task);
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

    this._noTasksComponent = new NoTasksComponent();
    this._sortComponent = new SortComponent();
    this._tasksComponent = new TasksComponent();
    this._loadMoreButtonComponent = new LoadMoreButtonComponent();
  }

  render(tasks) {
    const renderLoadMoreButton = (source) => {
      // Если отрисовывается кнопка, которая уже есть на странице, то она не продублируется, но добавится еще один обработчик
      // Поэтому удаляем ее полностью (не только из DOM, но и сам элемент, к которому привязывается обработчик)
      // Можно было бы запретить в компоненте кнопки добавлять больше одного обработчика, но это кажется неверным решением,
      // т.к. кнопка может иметь более одного обработчика на один клик (событие).
      // Также неудобно отдельно заниматься удалением существующих обработчиков
      if (this._loadMoreButtonComponent.isElementExists()) {
        remove(this._loadMoreButtonComponent);
      }

      // Не показываем кнопку, если не хватает элементов для дополнительной подгрузки
      if (showingTasksCount >= source.length) {
        return;
      }

      render(this._container.getElement(), this._loadMoreButtonComponent, RenderPosition.BEFOREEND);
      this._loadMoreButtonComponent.setClickHandler(() => {
        const prevTasksCount = showingTasksCount;
        showingTasksCount = showingTasksCount + SHOWING_TASKS_COUNT_BY_BUTTON;

        renderTasks(taskListElement, source.slice(prevTasksCount, showingTasksCount));

        if (showingTasksCount >= source.length) {
          remove(this._loadMoreButtonComponent);
        }
      });
    };

    if (tasks.length === 0) {
      render(this._container.getElement(), this._noTasksComponent, RenderPosition.BEFOREEND);
      return;
    }

    render(this._container.getElement(), this._sortComponent, RenderPosition.BEFOREEND);
    render(this._container.getElement(), this._tasksComponent, RenderPosition.BEFOREEND);

    const taskListElement = this._container.getElement().querySelector(`.board__tasks`);

    let showingTasksCount = SHOWING_TASKS_COUNT_ON_START;
    renderTasks(taskListElement, tasks.slice(0, showingTasksCount));

    renderLoadMoreButton(tasks);

    this._sortComponent.setSortTypeChangeHandler((sortType) => {
      const sortedTasks = getSortedTasks(tasks, sortType);

      taskListElement.innerHTML = ``;

      showingTasksCount = SHOWING_TASKS_COUNT_ON_START;
      renderTasks(taskListElement, sortedTasks.slice(0, showingTasksCount));

      renderLoadMoreButton(sortedTasks);
    });
  }
}
