import { useEffect, useState } from "react";
import { useContentStore } from "../store/content";
import axios from "axios";

const useGetTrending = () => {
  const [trending, setTrending] = useState(null);
  const { contentType } = useContentStore() as any;

  useEffect(() => {
    const getTrending = async () => {
      const res = await axios.get(`/api/v1/${contentType}/trending/day`);
      setTrending(res.data.content);
    }
    getTrending();
  }, [contentType])

  return { trending };
}

export default useGetTrending;