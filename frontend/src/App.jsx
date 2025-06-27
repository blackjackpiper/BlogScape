
import { useState, useEffect } from "react";
import axios from "axios";
import AuthForm from "./components/AuthForm";
import BlogForm from "./components/BlogForm";
import BlogList from "./components/BlogList";
import TrendsSidebar from "./components/TrendsSidebar";
import "./styles.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [publicBlogs, setPublicBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState("myBlogs");

  useEffect(() => {
    console.log("Active tab is:", activeTab);
    if (token) {
      localStorage.setItem("token", token);
      fetchBlogs();
    } else {
      localStorage.removeItem("token");
    }
  if (activeTab === "publicBlogs") {
    fetchPublicBlogs();
  }
  }, [token,activeTab]);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data);
    } catch (err) {
      alert("Session expired or not authorized");
      setToken("");
    }
  };

  const fetchPublicBlogs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/blogs/public`);
      setPublicBlogs(res.data);
    } catch (err) {
      console.error("Failed to fetch public blogs");
    }
  };

  return (
    <div className="app-wrapper">
      {!token ? (
        <>
          <AuthForm setToken={setToken} />
          <div className="centered-container">
            <BlogList
              token={token}
              blogs={publicBlogs}
              fetchBlogs={fetchBlogs}
              setEditingBlog={() => {}}
              editable={false}
              isPublic={true}
              showLikes={false}
            />
          </div>
        </>
      ) : (
        <>
          {/* ✅ Styled Navbar */}
          <nav className="navbar">
            <div className="navbar-title">BlogScape</div>
            <div className="navbar-buttons">
              <button onClick={() => setActiveTab("myBlogs")}>My Blogs</button>
              <button onClick={() => setActiveTab("publicBlogs")}>Public Blogs</button>
              <button onClick={() => setToken("")}>Logout</button>
            </div>
          </nav>

          {/* ✅ Main Layout */}
          <div className="main-layout">
            {activeTab === "myBlogs" && (
              <div className="my-blogs-layout">
                {/* LEFT SIDE: BlogForm + BlogList */}
                <div className="blog-section">
                  <BlogForm
                    token={token}
                    onSubmit={fetchBlogs}
                    selectedBlog={editingBlog}
                    clearSelection={() => setEditingBlog(null)}
                  />
                  <BlogList
                    token={token}
                    blogs={blogs}
                    fetchBlogs={fetchBlogs}
                    setEditingBlog={setEditingBlog}
                    editable={true}
                    isPublic={false}
                    showLikes={false}
                  />
                </div>

                {/* RIGHT SIDE: Trends Sidebar */}
                <div className="trend-sidebar-container">
                  <h2 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                    Trending Now 🌍
                  </h2>
                  <TrendsSidebar />
                </div>
              </div>
            )}


            {activeTab === "publicBlogs" && (
              <div className="centered-container">
                <BlogList
                  token={token}
                  blogs={publicBlogs}
                  fetchBlogs={fetchBlogs}
                  setEditingBlog={() => {}}
                  editable={false}
                  isPublic={true}
                  showLikes={true}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
