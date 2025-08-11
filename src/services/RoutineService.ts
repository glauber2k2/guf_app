// src/services/RoutineService.ts

import firestore, { Timestamp } from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { getDBConnection } from "../db/database";

export type ExerciseForRoutine = {
  id: string;
  name: string;
  muscleFocus: string;
  muscleSecondary: string[];
  notes: string;
  setsData: Array<{
    setNumber: number;
    previousReps?: string;
    previousKg?: string;
    kg: string;
    reps: string;
  }>;
};

export type Routine = {
  id: string;
  userId: string;
  name: string;
  exercises: ExerciseForRoutine[];
  createdAt?: Timestamp | null;
};

async function saveRoutineLocal(routine: Routine): Promise<void> {
  const db = await getDBConnection();
  const exercisesStr = JSON.stringify(routine.exercises);
  const createdAtMillis = routine.createdAt ? routine.createdAt.toMillis() : Date.now();

  await db.executeSql(
    `INSERT OR REPLACE INTO routines (id, name, exercises, createdAt) VALUES (?, ?, ?, ?)`,
    [routine.id, routine.name, exercisesStr, createdAtMillis]
  );
}

export async function saveRoutine(
  routineName: string,
  exercises: ExerciseForRoutine[]
): Promise<void> {
  const user = auth().currentUser;
  if (!user) throw new Error("Usuário não autenticado.");

  if (!routineName.trim()) {
    throw new Error("Nome da rotina é obrigatório.");
  }
  if (exercises.length === 0) {
    throw new Error("Deve conter pelo menos um exercício.");
  }

  // Salva no Firebase
  const docRef = await firestore().collection("routines").add({
    userId: user.uid,
    name: routineName.trim(),
    exercises,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  // Pega os dados do documento criado para garantir createdAt real
  const docSnap = await docRef.get();
  const data = docSnap.data();

  const routine: Routine = {
    id: docRef.id,
    userId: user.uid,
    name: routineName.trim(),
    exercises,
    createdAt: data?.createdAt ?? null,
  };

  // Salva localmente
  await saveRoutineLocal(routine);
}

export async function getAllRoutines(): Promise<Routine[]> {
  const user = auth().currentUser;
  if (!user) throw new Error("Usuário não autenticado.");

  const db = await getDBConnection();

  // Busca localmente primeiro
  const [result] = await db.executeSql(
    `SELECT * FROM routines ORDER BY createdAt DESC`
  );

  if (result.rows.length > 0) {
    const routines: Routine[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      routines.push({
        id: row.id,
        userId: user.uid,
        name: row.name,
        exercises: JSON.parse(row.exercises),
        createdAt: row.createdAt ? Timestamp.fromMillis(row.createdAt) : null,
      });
    }
    return routines;
  }

  // Se local vazio, busca no Firebase e sincroniza localmente
  const snapshot = await firestore()
    .collection("routines")
    .where("userId", "==", user.uid)
    .get();

  const routines: Routine[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const routine: Routine = {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      exercises: data.exercises as ExerciseForRoutine[],
      createdAt: data.createdAt ?? null,
    };
    routines.push(routine);

    // Salva localmente
    await saveRoutineLocal(routine);
  }

  return routines;
}

export async function deleteRoutine(id: string): Promise<void> {
  // Deleta no Firebase
  await firestore().collection("routines").doc(id).delete();

  // Deleta localmente
  const db = await getDBConnection();
  await db.executeSql(`DELETE FROM routines WHERE id = ?`, [id]);
}
