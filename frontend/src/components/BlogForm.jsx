import { useState, useEffect } from "react";
import axios from "axios";

export default function BlogForm({ token, onSubmit, selectedBlog, clearSelection }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (selectedBlog) {
      setTitle(selectedBlog.title);
      setContent(selectedBlog.content);
    }
  }, [selectedBlog]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", title);
    data.append("content", content);
    data.append("public", isPublic);

    try {
      if (selectedBlog) {
        await axios.put(`${import.meta.env.VITE_API_URL}/blogs/${selectedBlog.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/blogs`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSubmit();
      setTitle("");
      setContent("");
    } catch (err) {
  console.error("Error submitting blog:", err.response?.data || err.message || err);
  alert("Error submitting blog");
}
  };

  return (
    <div className="container">
      <h3>{selectedBlog ? "Edit Blog" : "Create Blog"}</h3>
      <form onSubmit={handleSubmit}>

        <label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Make Public
        </label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
        />
        <button type="submit">{selectedBlog ? "Update" : "Post"}</button>
        {selectedBlog && (
  <button
    type="button"
    onClick={clearSelection}
  >
    Cancel
  </button>
)}

      </form>
    </div>
  );
}
