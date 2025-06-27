/*import { useState, useEffect } from "react";
import axios from "axios";
import AuthForm from "./components/AuthForm";
import BlogForm from "./components/BlogForm";
import BlogList from "./components/BlogList";
import "./styles.css";
import TrendsSidebar from "./components/TrendsSidebar"; // Adjust path if needed

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [publicBlogs, setPublicBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState("myBlogs");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchBlogs();
    } else {
      localStorage.removeItem("token");
    }
    fetchPublicBlogs();
  }, [token]);

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
    <div>
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
        <div className="main-layout">
          
          <div className="navbar">
            <div className="navbar-title">BlogScape</div>
            <div className="navbar-buttons">
              <button onClick={() => setActiveTab("myBlogs")}>My Blogs</button>
              <button onClick={() => setActiveTab("publicBlogs")}>Public Blogs</button>
              <button onClick={() => setToken("")}>Logout</button>
            </div>
          </div>


          
          {activeTab === "myBlogs" && (
            <div
              className="my-blogs-layout"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div
                style={{
                  flex: 1,
                  maxWidth: "700px",
                  paddingRight: "2rem",
                }}
              >
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

              <div
                style={{
                  width: "260px",
                  maxHeight: "calc(100vh - 80px)",
                  overflowY: "auto",
                  borderLeft: "1px solid #ccc",
                  padding: "1rem",
                  backgroundColor: "#f8f8f8",
                  borderRadius: "8px",
                }}
              >
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
      )}
    </div>
  );
}

export default App;
*/

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
    if (token) {
      localStorage.setItem("token", token);
      fetchBlogs();
    } else {
      localStorage.removeItem("token");
    }
    fetchPublicBlogs();
  }, [token]);

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
