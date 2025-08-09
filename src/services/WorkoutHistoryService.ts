// src/services/WorkoutHistoryService.ts

import { ResultSet, Transaction } from 'react-native-sqlite-storage';
import { getDBConnection } from '../db/database';
import { WorkoutExercise } from '../features/workout/screens/WorkoutInProgressScreen';

interface WorkoutHistoryPayload {
  routineName: string;
  elapsedTime: number;
  workoutExercises: WorkoutExercise[];
}

class WorkoutHistoryService {

  // A função agora é envolvida em uma Promise para lidar com callbacks
  async addWorkoutToHistory(payload: WorkoutHistoryPayload) {
    const { routineName, elapsedTime, workoutExercises } = payload;
    const db = await getDBConnection();

    console.log("======================================================");
    console.log("🚀 Iniciando salvamento com método de CALLBACKS...");
    console.log("======================================================");

    return new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx) => {
          // 1. Inserir o registro principal do treino
          tx.executeSql(
            'INSERT INTO workout_history (routine_name, completed_at, duration_seconds) VALUES (?, ?, ?);',
            [routineName || "Treino Livre", Math.floor(Date.now() / 1000), elapsedTime],
            // Callback de sucesso do primeiro INSERT
            (tx, historyResult) => {
              const workoutHistoryId = historyResult.insertId;
              if (workoutHistoryId === undefined) {
                reject(new Error("Falha ao obter o insertId do histórico de treino."));
                return;
              }
              console.log(`✅ Registro principal salvo com ID: ${workoutHistoryId}`);

              // 2. Loop sobre os exercícios
              workoutExercises.forEach((exercise, exerciseIndex) => {
                tx.executeSql(
                  'INSERT INTO performed_exercises (workout_history_id, exercise_name, notes) VALUES (?, ?, ?);',
                  [workoutHistoryId, exercise.name, exercise.notes],
                  // Callback de sucesso do segundo INSERT
                  (tx, exerciseResult) => {
                    const performedExerciseId = exerciseResult.insertId;
                    if (performedExerciseId === undefined) {
                      reject(new Error(`Falha ao obter o insertId para o exercício: ${exercise.name}`));
                      return;
                    }
                    console.log(`  ✅ Exercício '${exercise.name}' salvo com ID: ${performedExerciseId}`);

                    // 3. Loop sobre as séries
                    exercise.setsData.forEach((set, setIndex) => {
                      tx.executeSql(
                        'INSERT INTO performed_sets (performed_exercise_id, set_number, weight_kg, reps) VALUES (?, ?, ?, ?);',
                        [performedExerciseId, set.setNumber, set.kg, set.reps],
                        // O callback aqui é opcional, mas podemos usá-lo para logar
                        () => {
                           console.log(`    ✅ Série #${set.setNumber} do exercício '${exercise.name}' salva.`);
                        },
                        (_, error) => {
                          console.error(`Erro ao salvar a série #${set.setNumber}`, error);
                          reject(error);
                          return false; // Retornar false para indicar que a transação deve ser revertida
                        }
                      );
                    });
                  },
                  (_, error) => {
                    console.error(`Erro ao salvar o exercício '${exercise.name}'`, error);
                    reject(error);
                    return false;
                  }
                );
              });
            },
            // Callback de erro do primeiro INSERT
            (_, error) => {
              console.error("Erro ao salvar o registro principal do treino", error);
              reject(error);
              return false;
            }
          );
        },
        // Callback de erro da TRANSAÇÃO
        (error) => {
          console.error("Erro na transação do histórico", error);
          reject(error);
        },
        // Callback de sucesso da TRANSAÇÃO
        () => {
          console.log("======================================================");
          console.log("🎉 Transação do histórico concluída com sucesso!");
          console.log("======================================================");
          resolve();
        }
      );
    });
  }

  async getWorkoutHistory() {
    const db = await getDBConnection();
    const [results] = await db.executeSql('SELECT * FROM workout_history ORDER BY completed_at DESC;');
    return results.rows.raw();
  }
}

export default new WorkoutHistoryService();