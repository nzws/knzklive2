const API_ENDPOINT = process.env.SRS_ENDPOINT || 'http://localhost:1985';

export const kickoffClient = async (id: string) => {
  await fetch(`${API_ENDPOINT}/api/v1/clients/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
