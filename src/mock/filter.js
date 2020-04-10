const filterNames = [
  `all`, `overdue`, `today`, `favorites`, `repeating`, `archive`
];

const truncateDate = (timestamp) => {
  const dateCopy = new Date(timestamp);
  dateCopy.setHours(0, 0, 0, 0);
  return dateCopy.getTime();
};

const calcFilterValues = (tasks) => {
  const filterMap = new Map();
  filterNames.forEach((it) => {
    filterMap.set(it, 0);
  });

  for (const task of tasks) {
    if (task.isArchive) {
      filterMap.set(`archive`, filterMap.get(`archive`) + 1);
      continue;
    }

    filterMap.set(`all`, filterMap.get(`all`) + 1);

    if (task.isFavorite) {
      filterMap.set(`favorites`, filterMap.get(`favorites`) + 1);
    }

    if (task.isRepeating) {
      filterMap.set(`repeating`, filterMap.get(`repeating`) + 1);
    } else {
      if (task.dueDate instanceof Date) {
        if (task.isExpired) {
          filterMap.set(`overdue`, filterMap.get(`overdue`) + 1);
        }

        const dueDateTimestamp = task.dueDate.getTime();
        if (truncateDate(Date.now()) === truncateDate(dueDateTimestamp)) {
          filterMap.set(`today`, filterMap.get(`today`) + 1);
        }
      }
    }

  }

  return filterMap;
};

const generateFilters = (tasks) => {
  const filterValues = calcFilterValues(tasks);

  // Преобразуем map в массив объектов
  return filterNames.map((it) => {
    return {
      title: it,
      count: filterValues.get(it),
    };
  });
};


export {generateFilters};
