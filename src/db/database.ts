// src/db/database.ts

import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DB_NAME = 'workouts.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Abre a conexão com o banco de dados ou retorna a conexão existente.
 */
export const getDBConnection = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabase({ name: DB_NAME, location: 'default' });
  return db;
};

/**
 * Cria todas as tabelas do aplicativo se elas não existirem.
 * Este é o único lugar onde os comandos CREATE TABLE devem estar.
 */
const createTables = async (dbInstance: SQLite.SQLiteDatabase) => {
  // Tabela de Rotinas
  await dbInstance.executeSql(`
    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      exercises TEXT NOT NULL
    );
  `);

  // Tabelas de Histórico
  await dbInstance.executeSql(`
    CREATE TABLE IF NOT EXISTS workout_history (
      id INTEGER PRIMARY KEY,
      routine_name TEXT,
      completed_at INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL
    );
  `);
  await dbInstance.executeSql(`
    CREATE TABLE IF NOT EXISTS performed_exercises (
      id INTEGER PRIMARY KEY,
      workout_history_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (workout_history_id) REFERENCES workout_history(id) ON DELETE CASCADE
    );
  `);
  await dbInstance.executeSql(`
    CREATE TABLE IF NOT EXISTS performed_sets (
      id INTEGER PRIMARY KEY,
      performed_exercise_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      weight_kg TEXT,
      reps TEXT,
      FOREIGN KEY (performed_exercise_id) REFERENCES performed_exercises(id) ON DELETE CASCADE
    );
  `);
};

/**
 * Função de inicialização a ser chamada uma vez quando o app iniciar.
 */
export const initDatabase = async (): Promise<void> => {
  const dbInstance = await getDBConnection();
  await createTables(dbInstance);
  console.log("Banco de dados e tabelas inicializados com sucesso!");
};