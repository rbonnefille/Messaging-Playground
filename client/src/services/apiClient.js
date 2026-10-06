const API_PREFIX = '/api';

export const apiUrl = url => {
  if (
    typeof url !== 'string' ||
    !url.startsWith('/') ||
    url.startsWith('//') ||
    url === API_PREFIX ||
    url.startsWith(`${API_PREFIX}/`)
  ) {
    return url;
  }

  return `${API_PREFIX}${url}`;
};

export const requestJson = async (url, options = {}) => {
  const response = await fetch(apiUrl(url), options);
  const data = await response.json();

  if (!response.ok || data?.error) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
};
