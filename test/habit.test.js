import { jest } from '@jest/globals';


jest.unstable_mockModule('../js/storage.js', () => ({
  addHabit: jest.fn(habit => habits.push(habit)),
  updateHabit: jest.fn((id, updates) => {
    const index = habits.findIndex(h => h.id === id);
    if (index > -1) habits[index] = { ...habits[index], ...updates };
    return true;
  }),
  deleteHabit: jest.fn(id => {
    const index = habits.findIndex(h => h.id === id);
    if (index > -1) habits.splice(index, 1);
    return true;
  }),
  getHabit: jest.fn(id => habits.find(h => h.id === id)),
  getHabits: jest.fn(() => habits),
}));


let habit;
let storage;
let habits = [];

beforeAll(async () => {

  storage = await import('../js/storage.js');
  habit = await import('../js/habitTracker.js');
});

beforeEach(() => {
 
  habits = [];
  jest.clearAllMocks();
});

test('should create a new habit', () => {
  const newHabit = habit.createHabit('Read', 'Education', 'Daily', [1,2,3]);
  expect(newHabit).toHaveProperty('id');
  expect(newHabit.name).toBe('Read');
  expect(storage.addHabit).toHaveBeenCalledWith(newHabit);
});

test('should delete a habit', () => {
  const newHabit = habit.createHabit('Sleep Early', 'Health', 'Daily');
  const result = habit.deleteHabit(newHabit.id);
  expect(result).toBe(true);
  expect(storage.deleteHabit).toHaveBeenCalledWith(newHabit.id);
});

test('should calculate streaks correctly', () => {
  const newHabit = habit.createHabit('Meditate', 'Personal', 'Daily');
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  habit.toggleHabitCompletion(newHabit.id, yesterday);
  habit.toggleHabitCompletion(newHabit.id, today);

  const updated = habit.getHabit(newHabit.id);
  expect(updated.currentStreak).toBeGreaterThanOrEqual(2);
});