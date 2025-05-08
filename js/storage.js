const HABITS_STORAGE_KEY = 'habitTracker_habits';


export const getHabits = () => {
  const habitsJson = localStorage.getItem(HABITS_STORAGE_KEY);
  return habitsJson ? JSON.parse(habitsJson) : [];
};

export const getHabit = (id) => {
  const habits = getHabits();
  return habits.find(habit => habit.id === id);
};

export const saveHabits = (habits) => {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
};

export const addHabit = (habit) => {
  const habits = getHabits();
  const updatedHabits = [...habits, habit];
  saveHabits(updatedHabits);
  return habit;
};

export const updateHabit = (id, updates) => {
  const habits = getHabits();
  const updatedHabits = habits.map(habit => 
    habit.id === id ? { ...habit, ...updates } : habit
  );
  saveHabits(updatedHabits);
  return updatedHabits.find(habit => habit.id === id); 
};

export const deleteHabit = (id) => {
  const habits = getHabits();
  const updatedHabits = habits.filter(habit => habit.id !== id);
  saveHabits(updatedHabits);
  return true; 
};


export const toggleHabitCompletion = (id, date) => {
  const habits = getHabits();
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  
  const updatedHabits = habits.map(habit => {
    if (habit.id === id) {
      const isCompleted = habit.completedDates?.includes(dateStr) || false;
      let completedDates, missedDates;
      
      if (isCompleted) {
        completedDates = habit.completedDates.filter(d => d !== dateStr);
        missedDates = habit.missedDates?.filter(d => d !== dateStr) || [];
      } else {
        completedDates = [...(habit.completedDates || []), dateStr];
        missedDates = habit.missedDates?.filter(d => d !== dateStr) || [];
      }
      
      return {
        ...habit,
        completedDates,
        missedDates,
        lastCompleted: isCompleted ? null : dateStr
      };
    }
    return habit;
  });
  
  saveHabits(updatedHabits);
  return updatedHabits.find(habit => habit.id === id);
};

export const updateHabitDates = (id, dates) => {
  const habits = getHabits();
  const updatedHabits = habits.map(habit => {
    if (habit.id === id) {
      return {
        ...habit,
        completedDates: dates,
        missedDates: habit.missedDates?.filter(d => dates.includes(d)) || []
      };
    }
    return habit;
  });
  
  saveHabits(updatedHabits);
  return updatedHabits.find(habit => habit.id === id);
};

export const markMissedDays = () => {
  const habits = getHabits();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const updatedHabits = habits.map(habit => {
    const createdDate = new Date(habit.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    
    let currentDate = new Date(createdDate);
    const missedDates = [];
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      
      if (habit.days?.includes(dayOfWeek)) {
        if (!habit.completedDates?.includes(dateStr)) {
          missedDates.push(dateStr);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      ...habit,
      missedDates: Array.from(new Set(missedDates)) 
    };
  });
  
  saveHabits(updatedHabits);
  return updatedHabits;
};

export const getStats = (date) => {
  const habits = getHabits();
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  const dayOfWeek = new Date(dateStr).getDay();
  
  const relevantHabits = habits.filter(habit => 
    habit.days?.includes(dayOfWeek)
  );
  
  return {
    total: relevantHabits.length,
    completedToday: relevantHabits.filter(habit => 
      habit.completedDates?.includes(dateStr)
    ).length,
    bestStreak: Math.max(0, ...relevantHabits.map(h => h.bestStreak || 0)),
    currentStreak: Math.max(0, ...relevantHabits.map(h => h.currentStreak || 0))
  };
};

export const resetAllData = () => {
  localStorage.removeItem(HABITS_STORAGE_KEY);
  return true;
};