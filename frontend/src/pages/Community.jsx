import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { ThumbsUp, Share2 } from "lucide-react";
import { blogData } from "../assets/assets";

const Blog = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);

  // ✅ SIH Community Blog Dummy Data
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    setBlogs(blogData);
    console.log(blogData);
  }, []);

  // ✅ Word limiter
  const limitWords = (text, wordLimit) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handlePost = () => {
    if (!title || !desc) return alert("Please add a title and description");

    const newBlog = {
      id: Date.now(),
      title,
      desc,
      image,
      date: new Date().toLocaleDateString(),
    };
    setBlogs([newBlog, ...blogs]);
    setTitle("");
    setDesc("");
    setImage(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-16 p-4 sm:p-6 md:p-10 lg:px-20 xl:px-40">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            SIH Community Blog
          </h1>
          <p className="text-gray-600 mt-2">
            Share your ideas, inspire innovation ✍️
          </p>
        </div>

        {/* Blog Composer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-md mb-10"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title..."
            className="w-full border rounded-lg p-3 text-sm sm:text-base mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <textarea
            value={desc}
            onChange={(e) => {
              const words = e.target.value.split(" ");
              if (words.length <= 100) {
                setDesc(e.target.value);
              }
            }}
            placeholder="Write a short description (max 100 words)..."
            rows={4}
            className="w-full border rounded-lg p-3 text-sm sm:text-base mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <p className="text-sm text-gray-500">
            {desc.split(" ").filter((w) => w !== "").length}/100 words
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-3"
          />
          {image && (
            <img
              src={image}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
          )}
          <button
            onClick={handlePost}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Publish
          </button>
        </motion.div>

        {/* Blog Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <motion.div
              key={blog.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-5 rounded-2xl shadow-md"
            >
              {blog.image && (
                <img
                  src={blog.image}
                  alt="Blog"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="font-semibold text-xl text-gray-800 mb-2">
                {blog.title}
              </h3>
              <p className="text-gray-700 mb-4">{limitWords(blog.desc, 20)}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{blog.date}</span>
                <div className="flex gap-4">
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    <ThumbsUp size={16} /> Like
                  </button>
                  <button className="flex items-center gap-1 hover:text-purple-600">
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
