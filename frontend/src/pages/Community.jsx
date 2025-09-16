import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { ThumbsUp, Share2, Leaf, ImagePlus, PenSquare } from "lucide-react";
import { blogData } from "../assets/assets";

const Community = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [blogs, setBlogs] = useState([]);

  // Dummy blogs on load
  useEffect(() => {
    setBlogs(blogData);
  }, []);

  // Word limiter
  const limitWords = (text, wordLimit) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
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
      <div className="min-h-screen  p-4 sm:p-6 md:p-10 lg:px-20 xl:px-40 bg-gradient-to-br from-green-50 to-white">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <Leaf className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#002b25] tracking-wide">
            Eco Community Blog 🌍
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Share your sustainable ideas, inspire innovation, and connect with
            eco-warriors across the world ✍️🌱
          </p>
        </motion.div>

        {/* Blog Composer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 mb-12"
        >
          <h2 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
            <PenSquare className="w-5 h-5 text-green-600" /> Create a Post
          </h2>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title..."
            className="w-full border rounded-lg p-3 text-sm sm:text-base mb-3 focus:ring-2 focus:ring-green-400 outline-none"
          />

          <textarea
            value={desc}
            onChange={(e) => {
              const words = e.target.value.split(" ");
              if (words.length <= 100) setDesc(e.target.value);
            }}
            placeholder="Write a short description (max 100 words)..."
            rows={4}
            className="w-full border rounded-lg p-3 text-sm sm:text-base mb-3 focus:ring-2 focus:ring-green-400 outline-none"
          />
          <p className="text-sm text-gray-500 mb-3">
            {desc.split(" ").filter((w) => w !== "").length}/100 words
          </p>

          {/* Image Upload */}
          <label className="flex items-center gap-2 cursor-pointer mb-3 text-green-700 hover:text-green-800">
            <ImagePlus className="w-5 h-5" />
            <span>Upload an image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {image && (
            <img
              src={image}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg mb-3 border"
            />
          )}

          <button
            onClick={handlePost}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <PenSquare size={18} /> Publish
          </button>
        </motion.div>

        {/* Blog Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-5 rounded-2xl shadow-md border border-green-100"
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
              <p className="text-gray-700 mb-4">{limitWords(blog.desc, 25)}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{blog.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Community;
