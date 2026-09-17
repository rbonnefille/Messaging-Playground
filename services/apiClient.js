export const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok || data?.error) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
};
