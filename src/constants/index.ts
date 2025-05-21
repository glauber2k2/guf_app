import { Exercise } from '../types'; // Importe Exercise do arquivo de tipos compartilhado

export const STORAGE_KEY = '@my_routines';

export const MOCK_AVAILABLE_EXERCISES: Omit<Exercise, 'sets' | 'reps'>[] = [
  { id: '1', name: 'Agachamento Livre' },
  { id: '2', name: 'Leg Press' },
  { id: '3', name: 'Cadeira Extensora' },
  { id: '4', name: 'Mesa Flexora' },
  { id: '5', name: 'Panturrilha em Pé' },
  { id: '6', name: 'Supino Reto com Barra' },
  { id: '7', name: 'Supino Inclinado Halteres' },
  { id: '8', name: 'Crucifixo Máquina' },
  { id: '9', name: 'Desenvolvimento Militar' },
  { id: '10', name: 'Remada Curvada' },
  { id: '11', name: 'Puxada Alta' },
  { id: '12', name: 'Rosca Direta' },
  { id: '13', name: 'Tríceps Corda' },
  { id: '14', name: 'Abdominal Crunch' },
  { id: '15', name: 'Prancha' },
  { id: '16', name: 'Corrida na Esteira' },
  { id: '17', name: 'Caminhada' },
];