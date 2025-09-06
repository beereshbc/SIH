export const mock = {
  stats: async () => ({
    totalTrees: 12450,
    verified: 10234,
    pending: 3216,
    issuedCredits: 8420,
  }),

  pendingProofs: async () =>
    Array.from({ length: 12 }).map((_, i) => ({
      id: `PEND-${1000 + i}`,
      user: `contrib_${i}`,
      species: ["Neem", "Mango", "Teak"][i % 3],
      plantedOn: new Date(Date.now() - i * 86400000).toISOString(),
      lat: 12.9 + i * 0.007,
      lng: 77.5 + i * 0.01,
      images: [],
      notes: `Auto-submitted proof ${i}`,
      estimatedCarbonKg: Math.round(8 + i * 2.3),
      wallet: `0x${Math.random().toString(16).slice(2, 12)}`,
    })),

  users: async () =>
    Array.from({ length: 30 }).map((_, i) => ({
      id: `U-${100 + i}`,
      name: `user_${i}`,
      role:
        i % 7 === 0 ? "Verifier" : i % 5 === 0 ? "Moderator" : "Contributor",
      joined: new Date(Date.now() - i * 86400000).toISOString(),
      totalTrees: Math.round(Math.random() * 150),
      status: Math.random() > 0.96 ? "Blocked" : "Active",
    })),

  credits: async () =>
    Array.from({ length: 16 }).map((_, i) => ({
      id: `C-${2000 + i}`,
      issuedTo: `0x${Math.random().toString(16).slice(2, 12)}`,
      kgCO2: Math.round(10 + Math.random() * 80),
      txHash: `0x${Math.random().toString(16).slice(2, 24)}`,
      issuedAt: new Date(Date.now() - i * 86400000).toISOString(),
    })),

  chainTxs: async () =>
    Array.from({ length: 10 }).map((_, i) => ({
      txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
      type: "ISSUE",
      block: 18000000 + i,
      when: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    })),

  issueOnChain: async (payload) => {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      success: true,
      txHash: `0x${Math.random().toString(16).slice(2, 18)}`,
    };
  },
};
