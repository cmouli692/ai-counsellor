import api from "../api/axios";
import { useEffect, useState } from "react";
import UniversityCard from "../components/UniversityCard";

export default function Universities() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/universities").then(res => setList(res.data));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      {list.map(u => <UniversityCard key={u.id} uni={u} />)}
    </div>
  );
}
