import { useEffect, useState } from "react";
import axios from "axios";

export default function TrendsSidebar() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrends = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:8000/trends");
        const trendList = res.data?.trends || [];
        setTrends(trendList);
      } catch (err) {
        console.error("Failed to load trends:", err);
        setError("Failed to load trends.");
      }
      setLoading(false);
    };

    loadTrends();
  }, []);

  return (
    <div
      className="w-[300px] max-h-screen overflow-y-auto p-4 bg-white border-l shadow-lg animate-fade-in"
      style={{
        fontFamily: "Arial, sans-serif",
      }}
    >

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-3">
        {trends.map((trend, idx) => (
          <a
            key={idx}
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-blue-50 hover:bg-blue-100 transition-colors duration-200 p-3 rounded-lg shadow hover:shadow-md"
          >
            <p className="text-sm font-medium text-blue-800">{trend.title}</p>
            <p className="text-xs text-gray-500">Traffic: {trend.traffic}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
