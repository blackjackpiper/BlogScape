import axios from "axios";
import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import TrendsSidebar from "./TrendsSidebar"; // Adjust path if needed

export default function BlogList({
  token,
  blogs,
  fetchBlogs,
  setEditingBlog,
  isPublic = false,
  editable = false,
  showLikes = true,
}) {
  const [expandedBlogId, setExpandedBlogId] = useState(null);
  const [similarBlogs, setSimilarBlogs] = useState([]);

  // Decode token to get user email (safely)
  let userEmail = "";
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userEmail = payload.email;
    }
  } catch (err) {
    console.error("Invalid token:", err);
  }

  // Fetch similar blogs when a blog is expanded (only for public blogs)
  useEffect(() => {
    if (expandedBlogId && isPublic) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/blogs/${expandedBlogId}/similar`)
        .then((res) => setSimilarBlogs(res.data))
        .catch((err) => {
          console.error("Error fetching similar blogs", err);
          setSimilarBlogs([]);
        });
    } else {
      setSimilarBlogs([]);
    }
  }, [expandedBlogId, isPublic]);

  const deleteBlog = async (id) => {
    if (!confirm("Delete this blog?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
    } catch (err) {
      alert("Error deleting blog");
    }
  };

  const likeBlog = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs/${id}/like`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchBlogs(); // ✅ Refresh like count immediately
    } catch (err) {
      console.error("Error liking blog", err);
    }
  };

  return (
    <div className="flex w-full">
      {/* LEFT SIDE: Blogs */}
      <div className={`${isPublic ? "w-full px-10 max-w-[1600px] mx-auto" : "px-4"}`}>
        <h2 className="center-heading">
          {isPublic ? "Public Blogs" : "Your Blogs"}
        </h2>

        {blogs.length === 0 && <p>No blogs yet.</p>}

        <div className={`${isPublic ? "public-blog-grid" : "flex flex-col gap-4"}`}>
          {[...blogs].reverse().map((blog) => {
            const actualLikes = blog.likes ?? 0;
            const alreadyLiked = blog.likers?.includes(userEmail);
            const isOwnBlog = blog.email === userEmail;
            const isExpanded = expandedBlogId === blog.id;

            return (
              <div
                id={`blog-${blog.id}`}
                key={blog.id}
                className={`blog-item ${isPublic ? "public-blog" : "private-blog"}`}
              >
                <h3>{blog.title}</h3>
                {isPublic && (
                  <p className="author">By: {blog.author || blog.username}</p>
                )}

                <p className="whitespace-pre-line break-words">
                  {isPublic && isExpanded
                    ? blog.content
                    : blog.content.slice(0, 100) + "..."}
                </p>

                {isPublic && showLikes && (
                  <div className="like-section">
                    <button
                      className="like-button"
                      onClick={() => likeBlog(blog.id)}
                      disabled={alreadyLiked || isOwnBlog}
                    >
                      <FaHeart color={isOwnBlog ? "grey" : "red"} size={16} />
                    </button>
                    <span>{actualLikes} likes</span>
                  </div>
                )}

                {isPublic && (
                  <div style={{ marginTop: "0.5rem" }}>
                    {isExpanded ? (
                      <button onClick={() => setExpandedBlogId(null)}>Collapse</button>
                    ) : (
                      <button onClick={() => setExpandedBlogId(blog.id)}>Read More</button>
                    )}
                  </div>
                )}

                {isPublic && isExpanded && similarBlogs.length > 0 && (
                  <div className="similar-blogs" style={{ marginTop: "1rem" }}>
                    <h4>🧠 Similar Blogs</h4>
                    <ul>
                      {similarBlogs.map((sblog) => (
                        <li key={sblog.id} style={{ marginBottom: "0.5rem" }}>
                          <a
                            href={`#blog-${sblog.id}`}
                            style={{ cursor: "pointer", textDecoration: "underline", color: "blue" }}
                          >
                            <strong>{sblog.title}</strong>
                          </a>
                          <p style={{ margin: 0 }}>{sblog.preview}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {editable && (
                  <div className="actions">
                    <button onClick={() => setEditingBlog(blog)}>Edit</button>
                    <button onClick={() => deleteBlog(blog.id)}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: Google Trends Sidebar (only for private blogs) */}
    </div>
  );
}
