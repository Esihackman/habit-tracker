import * as storage from './storage.js';

export const createHabit = (name, category, goal) => {
  const habit = {
    id: generateId(),
    name: name.trim(),
    category: category.trim(),
    goal: goal.trim(),
    createdAt: new Date().toISOString(),
    completedDates: [],
    currentStreak: 0,
    bestStreak: 0,
    missedDays: 0  
  };
  
  storage.addHabit(habit);
  return habit;
};

export const updateHabit = (id, updates) => {
  return storage.updateHabit(id, updates);
};

export const deleteHabit = (id) => {
  return storage.deleteHabit(id);
};
 
export const completeHabit = (id) => {
  return storage.completeHabit(id);
};

export const getAllHabits = () => {
  return storage.getHabits();
};

export const filterHabitsByCategory = (category) => {
  const habits = getAllHabits();
  
  if (category === 'all') {
    return habits;
  }
  
  return habits.filter(habit => habit.category === category);
};
 
export const isCompletedToday = (habit) => {
  const today = new Date().toISOString().split('T')[0];
  return habit.completedDates?.includes(today) || false;
};


export const wasHabitMissed = (habit, date) => {

  const dateStr = date instanceof Date 
    ? date.toISOString().split('T')[0] 
    : date;
  
  
  const habitCreatedDate = habit.createdAt.split('T')[0];
  const habitExistedOnDate = habitCreatedDate <= dateStr;
  
  
  if (!habitExistedOnDate) {
    return false;
  }
  
  
  const isCompleted = habit.completedDates?.includes(dateStr) || false;
  
  
  const today = new Date().toISOString().split('T')[0];
  const isInFuture = dateStr > today;
  
  
  return !isCompleted && !isInFuture;
};

export const calculateMissedDays = (habit) => {
  const today = new Date();
  const createdDate = new Date(habit.createdAt);
  let missedCount = 0;
  
  
  const currentDate = new Date(createdDate);
  while (currentDate < today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (wasHabitMissed(habit, dateStr)) {
      missedCount++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return missedCount;
};

export const updateMissedDays = () => {
  const habits = getAllHabits();
  let updated = false;
  
  habits.forEach(habit => {
    const missedDays = calculateMissedDays(habit);
    if (habit.missedDays !== missedDays) {
      habit.missedDays = missedDays;
      updateHabit(habit.id, { missedDays });
      updated = true;
    }
  });
  
  return updated;
};

export const getStats = () => {

  updateMissedDays();
  
  return storage.getStats();
};

export const getLongestStreak = () => {
  const habits = getAllHabits();
  return Math.max(0, ...habits.map(habit => habit.bestStreak || 0));
};
 
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
 
export const resetAllData = () => {
  storage.resetAllData();
};