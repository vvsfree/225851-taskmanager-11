import {COLORS} from "../const.js";

const DescriptionItems = [
  `Изучить теорию`,
  `Сделать домашку`,
  `Поработать над личным проектом`,
  `Пройти интенсив на соточку`,
  `Посмотреть новый фильм`,
  `Пить кофе`,
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

const getRandomBoolean = (probability = 0.5) => {
  return Math.random() < probability;
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
  const isRepeating = getRandomBoolean(0.3);
  if (isRepeating) {
    repeatingDays = generateRepeatingDays();
  } else {
    dueDate = getRandomBoolean(0.8) ? getRandomDate() : null;
  }

  return {
    id: String(new Date() + Math.random()),
    description: getRandomArrayItem(DescriptionItems),
    dueDate,
    repeatingDays,
    color: getRandomArrayItem(COLORS),
    isArchive: getRandomBoolean(0.2),
    isFavorite: getRandomBoolean()
  };
};

const generateTasks = (count) => {
  return new Array(count)
    .fill(``)
    .map(generateTask);
};

export {generateTasks};
