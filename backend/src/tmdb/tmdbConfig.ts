import { TMDB_API_BASE_URL, TMDB_API_KEY } from "../constant/env";

function getUrl(endpoint: string, params = {}) {
  const qs = new URLSearchParams({...params});

  const url = `${TMDB_API_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&${qs}`;

  return url;
}

export default {getUrl};