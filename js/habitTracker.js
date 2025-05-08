import * as storage from './storage.js';




const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const createHabit = (name, category, goal, days = []) => {
  const habit = {
    id: generateId(),  
    name: name.trim(),
    category: category.trim(),
    goal: goal.trim(),
    days: days, 
    createdAt: new Date().toISOString(),
    completedDates: [],
    missedDates: [],
    currentStreak: 0,
    bestStreak: 0,
    lastCompleted: null
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

export const toggleHabitCompletion = (id, date) => {
  const habit = storage.getHabit(id);
  if (!habit) return false;

  const dateObj = date instanceof Date ? date : new Date(date);
  const dateStr = dateObj.toISOString().split('T')[0];
  
  const isCompleted = habit.completedDates.includes(dateStr);
  
  if (isCompleted) {
    habit.completedDates = habit.completedDates.filter(d => d !== dateStr);
    habit.missedDates = habit.missedDates.filter(d => d !== dateStr);
  } else {
    habit.completedDates.push(dateStr);
    habit.missedDates = habit.missedDates.filter(d => d !== dateStr);
    habit.lastCompleted = dateStr;
  }
  
  updateStreaks(habit);
  
  return storage.updateHabit(id, {
    completedDates: habit.completedDates,
    missedDates: habit.missedDates,
    currentStreak: habit.currentStreak,
    bestStreak: habit.bestStreak,
    lastCompleted: habit.lastCompleted
  });
};

export const updateHabitDates = (id, dates) => {
  const habit = storage.getHabit(id);
  if (!habit) return false;

  habit.completedDates = dates;
  updateStreaks(habit);
  
  return storage.updateHabit(id, {
    completedDates: habit.completedDates,
    currentStreak: habit.currentStreak,
    bestStreak: habit.bestStreak,
    lastCompleted: habit.lastCompleted
  });
};

export const getAllHabits = () => {
  return storage.getHabits();
};

export const getHabit = (id) => {
  return storage.getHabit(id);
};

export const getHabitsForDay = (dayOfWeek, category = 'all') => {
  const habits = getAllHabits();
  return habits.filter(habit => {
    const categoryMatch = category === 'all' || habit.category === category;
    const dayMatch = habit.days.includes(dayOfWeek);
    return categoryMatch && dayMatch;
  });
};

export const isCompletedOnDate = (id, date) => {
  const habit = storage.getHabit(id);
  if (!habit) return false;
  
  const dateStr = date instanceof Date ? 
    date.toISOString().split('T')[0] : 
    new Date(date).toISOString().split('T')[0];
    
  return habit.completedDates.includes(dateStr);
};

export const updateStreaks = (habit) => {
  if (!habit.completedDates || habit.completedDates.length === 0) {
    habit.currentStreak = 0;
    habit.bestStreak = Math.max(habit.bestStreak || 0, 0);
    return;
  }
  
  const sortedDates = [...habit.completedDates].sort();
  let currentStreak = 1;
  let maxStreak = 1;
  
  let prevDate = new Date(sortedDates[sortedDates.length - 1]);
  let streakBroken = false;
  
  for (let i = sortedDates.length - 2; i >= 0 && !streakBroken; i--) {
    const currentDate = new Date(sortedDates[i]);
    const diffTime = prevDate - currentDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diffDays > 1) {
      streakBroken = true;
    }
    
    prevDate = currentDate;
  }
  
  habit.currentStreak = currentStreak;
  habit.bestStreak = Math.max(habit.bestStreak || 0, maxStreak);
};

export const getStats = (date = new Date()) => {
  const dateStr = date instanceof Date ? 
    date.toISOString().split('T')[0] : 
    new Date(date).toISOString().split('T')[0];
  
  const dayOfWeek = date.getDay();
  const habits = getHabitsForDay(dayOfWeek);
  
  const totalHabits = habits.length;
  const completedToday = habits.filter(habit => 
    habit.completedDates.includes(dateStr)
  ).length;
  
  const bestStreak = Math.max(0, ...habits.map(h => h.bestStreak || 0));
  const missedDays = habits.reduce((total, habit) => total + (habit.missedDates?.length || 0), 0);
  
  return {
    total: totalHabits,
    completedToday,
    bestStreak,
    missedDays,
    completionPercentage: totalHabits > 0 ? 
      Math.round((completedToday / totalHabits) * 100) : 0
  };
};




export const markMissedDays = () => {
  const habits = getAllHabits();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
 
  let updatesApplied = false;
  
  habits.forEach(habit => {
   
    const createdDate = new Date(habit.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    
    
    const lastCheckDate = habit.lastCheckDate ? new Date(habit.lastCheckDate) : createdDate;
    let startDate = new Date(lastCheckDate);
    
  
    if (isSameDay(startDate, today)) {
      return;
    }
    
    const missedDates = [...(habit.missedDates || [])];
    let currentDate = new Date(startDate);
    let datesUpdated = false;
    
    
    while (currentDate < today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      
      
      if (habit.days.includes(dayOfWeek) && 
          !habit.completedDates.includes(dateStr) && 
          !missedDates.includes(dateStr)) {
        missedDates.push(dateStr);
        datesUpdated = true;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    
    if (datesUpdated) {
      storage.updateHabit(habit.id, { 
        missedDates,
        lastCheckDate: today.toISOString() 
      });
      updatesApplied = true;
    } else {
      
      storage.updateHabit(habit.id, { 
        lastCheckDate: today.toISOString() 
      });
    }
  });
  
  return updatesApplied;
};

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

export const initializeApp = () => {
  markMissedDays();
  
  
  scheduleNextDailyCheck();
};


function scheduleNextDailyCheck() {
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow - now;
  setTimeout(() => {
    markMissedDays();
    scheduleNextDailyCheck(); 
  }, timeUntilMidnight);
}


export const checkMissedDays = () => {
  return markMissedDays();
};


initializeApp();