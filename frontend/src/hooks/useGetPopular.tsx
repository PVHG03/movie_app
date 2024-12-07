import { useEffect, useState } from "react";
import { useContentStore } from "../store/content";
import axios from "axios";

const useGetPopular = () => {
  const [popular, setPopular] = useState(null);
  const { contentType } = useContentStore() as any;

  useEffect(() => {
    const getPopular = async () => {
      const res = await axios.get(`/api/v1/${contentType}/popular`);
      setPopular(res.data);
    }
    getPopular();
  }, [contentType])

  return { popular };
}

export default useGetPopular;