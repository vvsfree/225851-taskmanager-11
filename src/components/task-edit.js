import AbstractSmartComponent from "./abstract-smart-component.js";
import {COLORS, DAYS} from "../const.js";
import {formatTime, formatDate} from "../utils/common.js";
import flatpickr from "flatpickr";

import "flatpickr/dist/flatpickr.min.css";

const isSomeDayChosen = (repeatingDays) => {
  return Object.values(repeatingDays).some(Boolean);
};

const createColorsMarkup = (colors, currentColor) => {
  return colors
    .map((color, index) => {
      return (
        `<input
          type="radio"
          id="color-${color}-${index}"
          class="card__color-input card__color-input--${color} visually-hidden"
          name="color"
          value="${color}"
          ${currentColor === color ? `checked` : ``}
        />
        <label
          for="color-${color}--${index}"
          class="card__color card__color--${color}"
          >${color}</label
        >`
      );
    })
    .join(`\n`);
};

const createRepeatingDaysMarkup = (days, repeatingDays) => {
  return days
    .map((day, index) => {
      const isChecked = repeatingDays[day];
      return (
        `<input
          class="visually-hidden card__repeat-day-input"
          type="checkbox"
          id="repeat-${day}-${index}"
          name="repeat"
          value="${day}"
          ${isChecked ? `checked` : ``}
        />
        <label class="card__repeat-day" for="repeat-${day}-${index}"
          >${day}</label
        >`
      );
    })
    .join(`\n`);
};


const createTaskEditTemplate = (task, options = {}) => {
  const {description, dueDate, color, isExpired} = task;
  const {isDateShowing, isRepeatingTask, activeRepeatingDays} = options;

  // По условиям техзадания пользователь не может сохранить изменения, если он указал, что дата у задачи есть, но не выбрал её.
  // Аналогично с днями повторения. Поэтому нам нужно блокировать кнопку в таких случаях.
  const isBlockSaveButton = (isDateShowing && isRepeatingTask) ||
    (isRepeatingTask && !isSomeDayChosen(activeRepeatingDays));

  const date = (isDateShowing && dueDate) ? formatDate(dueDate) : ``;
  const time = (isDateShowing && dueDate) ? formatTime(dueDate) : ``;

  const repeatClass = isRepeatingTask ? `card--repeat` : ``;
  const deadlineClass = isExpired ? `card--deadline` : ``;

  const colorsMarkup = createColorsMarkup(COLORS, color);
  const repeatingDaysMarkup = createRepeatingDaysMarkup(DAYS, activeRepeatingDays);

  return (
    `<article class="card card--edit card--${color} ${repeatClass} ${deadlineClass}">
      <form class="card__form" method="get">
        <div class="card__inner">
          <div class="card__color-bar">
            <svg class="card__color-bar-wave" width="100%" height="10">
              <use xlink:href="#wave"></use>
            </svg>
          </div>

          <div class="card__textarea-wrap">
            <label>
              <textarea
                class="card__text"
                placeholder="Start typing your text here..."
                name="text"
              >${description}</textarea>
            </label>
          </div>

          <div class="card__settings">
            <div class="card__details">
              <div class="card__dates">
                <button class="card__date-deadline-toggle" type="button">
                  date: <span class="card__date-status">${isDateShowing ? `yes` : `no`}</span>
                </button>

                ${isDateShowing ? `<fieldset class="card__date-deadline">
                  <label class="card__input-deadline-wrap">
                    <input
                      class="card__date"
                      type="text"
                      placeholder=""
                      name="date"
                      value="${date} ${time}"
                    />
                  </label>
                </fieldset>` : ``}

                <button class="card__repeat-toggle" type="button">
                  repeat:<span class="card__repeat-status">${isRepeatingTask ? `yes` : `no`}</span>
                </button>

                ${isRepeatingTask ? `<fieldset class="card__repeat-days">
                  <div class="card__repeat-days-inner">
                    ${repeatingDaysMarkup}
                  </div>
                </fieldset>` : ``}
              </div>
            </div>

            <div class="card__colors-inner">
              <h3 class="card__colors-title">Color</h3>
              <div class="card__colors-wrap">
                ${colorsMarkup}
              </div>
            </div>
          </div>

          <div class="card__status-btns">
            <button class="card__save" type="submit" ${isBlockSaveButton ? `disabled` : ``}>save</button>
            <button class="card__delete" type="button">delete</button>
          </div>
        </div>
      </form>
    </article>`
  );
};

export default class TaskEdit extends AbstractSmartComponent {
  constructor(task) {
    super();

    this._task = task;
    this._isDateShowing = !!task.dueDate;
    this._isRepeatingTask = task.isRepeating;
    this._activeRepeatingDays = Object.assign({}, task.repeatingDays);

    this._flatpickr = null;
    this._isCalendarOpen = false;

    this._submitHandler = null;

    this._subscribeOnEvents();
  }

  getTemplate() {
    const template = createTaskEditTemplate(this._task, {
      isDateShowing: this._isDateShowing,
      isRepeatingTask: this._isRepeatingTask,
      activeRepeatingDays: this._activeRepeatingDays,
    });

    return template;
  }

  recoveryListeners() {
    this.setSubmitHandler(this._submitHandler);
    this._subscribeOnEvents();
  }

  rerender() {
    super.rerender();
    this.applyCalendar();
  }

  reset() {
    const task = this._task;

    this._isDateShowing = !!task.dueDate;
    this._isRepeatingTask = task.isRepeating;
    this._activeRepeatingDays = Object.assign({}, task.repeatingDays);

    this._clearCalendar();
  }

  setSubmitHandler(handler) {
    this.getElement().querySelector(`form`)
      .addEventListener(`submit`, handler);

    this._submitHandler = handler;
  }

  // Нажали клавишу Esc. Если окно календаря открыто, его нужно закрыть, не закрывая окно редактирования задачи
  checkCalendar(evt) {
    const closestElement = evt.target.closest(`.flatpickr-calendar`);
    // 1) Фокус был на календаре. В этом случае календарь сам исчезнет, но окно редактирования задачи должно остаться
    if (closestElement !== null) {
      return false;
    }
    // 2) Фокус был не на календаре, а в поле даты (на которую навешан календарь).
    // В этом случае, если окно календаря открыто, то закрыть нужно только его.
    // Примечание: если выставить фокус куда-нибудь вне поля даты или календаря (кликнуть мышью) - календарь автоматически закроется.
    if (this._flatpickr && this._isCalendarOpen) {
      this._flatpickr.close();
      return false;
    }
    // Окно календаря закрыто и не "препятствует" закрытию окна редактирования задачи
    return true;
  }

  _clearCalendar() {
    if (this._flatpickr) {
      // При своем создании `flatpickr` дополнительно создает вспомогательные DOM-элементы.
      // Что бы их удалять, нужно вызывать метод `destroy` у созданного инстанса `flatpickr`.
      this._flatpickr.destroy();
      this._flatpickr = null;
      this._isCalendarOpen = false;
    }
  }

  applyCalendar() {
    this._clearCalendar();

    if (this._isDateShowing) {
      const dateElement = this.getElement().querySelector(`.card__date`);
      this._flatpickr = flatpickr(dateElement, {
        enableTime: true,
        defaultDate: this._task.dueDate || `today`,
        dateFormat: `Y-m-d H:i`,
        altInput: true,
        allowInput: true,
        altFormat: `j F H:i`,
        onOpen: [() => {
          this._isCalendarOpen = true;
        }],
        onClose: () => {
          this._isCalendarOpen = false;
        }
      });
    }
  }

  _subscribeOnEvents() {
    const element = this.getElement();

    element.querySelector(`.card__date-deadline-toggle`)
      .addEventListener(`click`, () => {
        this._isDateShowing = !this._isDateShowing;

        this.rerender();
      });

    element.querySelector(`.card__repeat-toggle`)
      .addEventListener(`click`, () => {
        this._isRepeatingTask = !this._isRepeatingTask;

        this.rerender();
      });

    const repeatDays = element.querySelector(`.card__repeat-days`);
    if (repeatDays) {
      repeatDays.addEventListener(`change`, (evt) => {
        this._activeRepeatingDays[evt.target.value] = evt.target.checked;

        this.rerender();
      });
    }
  }
}
