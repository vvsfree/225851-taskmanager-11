import {COLORS} from "../const.js";

const DescriptionItems = [
  `Изучить теорию`,
  `Сделать домашку`,
  `Поработать над личным проектом`,
  `Пройти интенсив на соточку`,
  `Посидеть на карантине`,
  `Гулять на балконе`,
];

const DefaultRepeatingDays = {
  "mo": false,
  "tu": false,
  "we": false,
  "th": false,
  "fr": false,
  "sa": false,
  "su": false,
};

const getRandomBoolean = () => {
  return Math.random() > 0.5;
};

const getRandomArrayItem = (array) => {
  const randomIndex = getRandomIntegerNumber(0, array.length);

  return array[randomIndex];
};

const getRandomIntegerNumber = (min, max) => {
  return min + Math.floor(Math.random() * (max - min));
};

const getRandomDate = () => {
  const targetDate = new Date();
  let sign = getRandomBoolean() ? 1 : -1;
  // Добавляем / отнимаем случайное число дней
  let diffValue = sign * getRandomIntegerNumber(0, 8);
  targetDate.setDate(targetDate.getDate() + diffValue);

  sign = getRandomBoolean() ? 1 : -1;
  // Добавляем / отнимаем случайное число минут (от 0 до часа)
  diffValue = sign * 1000 * 60 * getRandomIntegerNumber(0, 60);
  targetDate.setTime(targetDate.getTime() + diffValue);

  return targetDate;
};

const getRandomDays = () => {
  return Object.keys(DefaultRepeatingDays).map((it) => {
    return {
      [it]: getRandomBoolean()
    };
  });
};

const generateRepeatingDays = () => {
  return Object.assign({}, ...getRandomDays());
};

const generateTask = () => {
  let dueDate = null;
  let repeatingDays = DefaultRepeatingDays;
  const isRepeating = getRandomBoolean();
  if (isRepeating) {
    repeatingDays = generateRepeatingDays();
  } else {
    dueDate = getRandomBoolean() ? null : getRandomDate();
  }

  return {
    description: getRandomArrayItem(DescriptionItems),
    dueDate,
    repeatingDays,
    color: getRandomArrayItem(COLORS),
    isRepeating,
    isArchive: getRandomBoolean(),
    isFavorite: getRandomBoolean(),
    get isExpired() {
      return this.dueDate instanceof Date && this.dueDate < Date.now();
    }
  };
};

const generateTasks = (count) => {
  return new Array(count)
    .fill(``)
    .map(generateTask);
};

export {generateTasks};
