// src/services/RoutineService.ts

import { getDBConnection } from '../db/database';

// ... (as interfaces Routine e RoutineFromDB permanecem aqui ou podem ir para o types.ts)
interface RoutineFromDB {
  id: number; name: string; exercises: string;
}
export interface Routine {
  id: string; name: string; exercises: string;
}


class RoutineService {
  
  async getAllRoutines(): Promise<Routine[]> {
    const db = await getDBConnection(); // Apenas pega a conexão
    const [results] = await db.executeSql('SELECT * FROM routines;');
    const routines: Routine[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row: RoutineFromDB = results.rows.item(i);
      routines.push({ ...row, id: row.id.toString() });
    }
    return routines;
  }

  async addRoutine(routineData: { name: string; exercises: string }) {
    const db = await getDBConnection();
    await db.executeSql(
      'INSERT INTO routines (name, exercises) VALUES (?, ?);',
      [routineData.name, routineData.exercises]
    );
  }

  async updateRoutine(routine: Routine) {
    const db = await getDBConnection();
    await db.executeSql(
      'UPDATE routines SET name = ?, exercises = ? WHERE id = ?;',
      [routine.name, routine.exercises, routine.id]
    );
  }

  async deleteRoutine(id: string) {
    const db = await getDBConnection();
    await db.executeSql('DELETE FROM routines WHERE id = ?;', [id]);
  }
}

export default new RoutineService();