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
    bestStreak: 0
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


export const getStats = () => {
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