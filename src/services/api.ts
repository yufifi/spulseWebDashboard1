// mocks para simular backend
export async function fetchVisitorsStats() {
  return { total: 1234, today: 56 };
}

export async function fetchVisitorsLast7Days() {
  return {
    dates: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"],
    counts: [120, 150, 90, 200, 300, 250, 400],
  };
}

export async function fetchCheckpointsByPavilion() {
  return [
    { name: "Pavilhão 1", value: 50 },
    { name: "Pavilhão 2", value: 80 },
    { name: "Pavilhão 3", value: 40 },
  ];
}

export async function fetchUserPavilion(email: string | null) {
  return email ? "Pavilhão 1" : null;
}

export async function checkIfUserIsAdmin(email: string | null) {
  return email === "admin@example.com";
}

export async function fetchRecentCheckpoints() {
  return 15;
}
