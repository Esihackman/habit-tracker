const HABITS_STORAGE_KEY = 'habitTracker_habits';

export const getHabits = () => {
  const habitsJson = localStorage.getItem(HABITS_STORAGE_KEY);
  return habitsJson ? JSON.parse(habitsJson) : [];
};

export const saveHabits = (habits) => {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
};

export const addHabit = (habit) => {
  const habits = getHabits();
  const updatedHabits = [...habits, habit];
  saveHabits(updatedHabits);
  return updatedHabits;
};

export const updateHabit = (id, updatedHabit) => {
  const habits = getHabits();
  const updatedHabits = habits.map(habit => 
    habit.id === id ? { ...habit, ...updatedHabit } : habit
  );
  saveHabits(updatedHabits);
  return updatedHabits;
};

export const deleteHabit = (id) => {
  const habits = getHabits();
  const updatedHabits = habits.filter(habit => habit.id !== id);
  saveHabits(updatedHabits);
  return updatedHabits;
};

export const completeHabit = (id) => {
  const habits = getHabits();
  const today = new Date().toISOString().split('T')[0]; 
  
  const updatedHabits = habits.map(habit => {
    if (habit.id === id) {
      
      const isAlreadyCompleted = habit.completedDates?.includes(today);
      
      if (isAlreadyCompleted) {
        
        return {
          ...habit,
          completedDates: habit.completedDates.filter(date => date !== today),
          currentStreak: Math.max(0, habit.currentStreak - 1)
        };
      } else {
        
        const completedDates = [...(habit.completedDates || []), today];
        
    
        let currentStreak = habit.currentStreak || 0;
        currentStreak++;
        
        
        const bestStreak = Math.max(currentStreak, habit.bestStreak || 0);
        
        return {
          ...habit,
          completedDates,
          currentStreak,
          bestStreak
        };
      }
    }
    return habit;
  });
  
  saveHabits(updatedHabits);
  return updatedHabits;
};

export const getStats = () => {
  const habits = getHabits();
  const today = new Date().toISOString().split('T')[0];
  
  const totalMissedDays = habits.reduce((total, habit) => {
    return total + (habit.missedDays || 0);
  }, 0);
  
  const stats = {
    total: habits.length,
    completedToday: habits.filter(habit => 
      habit.completedDates?.includes(today)
    ).length,
    bestStreak: Math.max(0, ...habits.map(habit => habit.bestStreak || 0)),
    missedDays: totalMissedDays
  };
  
  return stats;
};

export const resetAllData = () => {
  localStorage.removeItem(HABITS_STORAGE_KEY);
  return true;
};