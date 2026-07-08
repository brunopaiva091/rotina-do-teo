export interface CheckItem {
  done: boolean;
  time: string | null;
}

export interface RatingItem extends CheckItem {
  stars: number;
}

export interface WaterItem {
  ml: number | null;
  time: string | null;
}

export interface FruitItem {
  done: boolean;
  time: string | null;
  fruits: string[];
  stars: number;
}

export type ExerciseId = 'ex1' | 'ex2' | 'ex3';

export interface ExerciseState {
  done: boolean;
  time: string | null;
  stars: number;
}

export interface ExercisesRecord {
  ex1: ExerciseState;
  ex2: ExerciseState;
  ex3: ExerciseState;
}

export interface DayRecord {
  date: string;
  lastUpdated: string;
  morning: {
    medicines: {
      kollis: CheckItem;
      ferro: CheckItem;
      vitaminaD: CheckItem;
    };
    water: WaterItem;
    fruit: FruitItem;
    exercises: ExercisesRecord;
  };
  afternoon: {
    lunch: RatingItem;
    water: WaterItem;
    fruit: FruitItem;
    exercises: ExercisesRecord;
  };
}
