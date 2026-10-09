export const DOCTOR_UNLOCK_KEY = "philo-kombat:story:doctor-unlocked";
export const ENDING_TIMING = { celebration: 6600, blackout: 800 };
export const SUPERINTELLIGENCE_RETURN_LINE = "Você venceu uma batalha, mas não a guerra… Você tem o modo Doutor agora!";

export function readDoctorUnlocked(storage) {
  try { return storage.getItem(DOCTOR_UNLOCK_KEY) === "1"; }
  catch { return false; }
}

export function unlockDoctor(storage) {
  try { storage.setItem(DOCTOR_UNLOCK_KEY, "1"); }
  catch { /* A conquista continua disponível durante a sessão. */ }
  return true;
}
