import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import Navbar from "../components/Navbar";
import { pinata } from "../config/pinata";
import { connectWallet } from "../utils/wallet";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  MapPin,
  Wallet,
  Trees,
  FileText,
  CloudUpload,
  Camera,
  Leaf,
  Ruler,
  Box,
} from "lucide-react";

const webcamConstraints = {
  facingMode: "environment",
  width: 1280,
  height: 720,
};

export default function Registry() {
  const [step, setStep] = useState(1);

  const [ngo, setNgo] = useState({ name: "", email: "", location: "" });

  const [project, setProject] = useState({
    title: "",
    ecosystem: "Mangrove",
    location: "",
    treesPlanted: "",
    areaRestored: "",
    carbonStored: "",
    description: "",
  });

  const { axios } = useAppContext();
  const [walletAddress, setWalletAddress] = useState(null);

  const [images, setImages] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const webcamRef = useRef(null);

  // Load drafts
  useEffect(() => {
    try {
      const draftNgo = localStorage.getItem("registry_ngo");
      const draftProject = localStorage.getItem("registry_project");
      const draftImages = localStorage.getItem("registry_images");
      if (draftNgo) setNgo(JSON.parse(draftNgo));
      if (draftProject) setProject(JSON.parse(draftProject));
      if (draftImages) setImages(JSON.parse(draftImages));
    } catch (e) {
      console.warn("Failed to load drafts", e);
    }
  }, []);

  // ---------- STEP HANDLERS ----------
  const saveNgoAndNext = () => {
    if (!ngo.name || !ngo.email) {
      toast.error("Please provide NGO name and email before next.");
      return;
    }
    localStorage.setItem("registry_ngo", JSON.stringify(ngo));
    toast.success("NGO details saved.");
    setStep(2);
  };

  const saveProjectAndNext = () => {
    if (!project.title || !project.treesPlanted) {
      toast.error(
        "Please provide Project Title and Trees Planted before next."
      );
      return;
    }
    localStorage.setItem("registry_project", JSON.stringify(project));
    toast.success("Project details saved.");
    setStep(3);
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  // ---------- CAMERA + UPLOAD ----------
  const handleCapture = () => {
    if (!webcamRef.current) {
      toast.error("Camera not available.");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Unable to capture image. Try file upload.");
      return;
    }

    setLoadingGeo(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newImg = {
            id: Date.now(),
            dataUrl: imageSrc,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: new Date().toISOString(),
          };
          setImages((prev) => {
            const next = [newImg, ...prev];
            localStorage.setItem("registry_images", JSON.stringify(next));
            return next;
          });
          toast.success("Captured image with GPS.");
          setLoadingGeo(false);
        },
        (err) => {
          const newImg = {
            id: Date.now(),
            dataUrl: imageSrc,
            lat: null,
            lng: null,
            gpsError: err.message,
            timestamp: new Date().toISOString(),
          };
          setImages((prev) => {
            const next = [newImg, ...prev];
            localStorage.setItem("registry_images", JSON.stringify(next));
            return next;
          });
          toast.error("Captured image but GPS not available");
          setLoadingGeo(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (navigator.geolocation) {
          setLoadingGeo(true);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const newImg = {
                id: Date.now() + Math.random(),
                dataUrl,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                timestamp: new Date().toISOString(),
              };
              setImages((prev) => {
                const next = [newImg, ...prev];
                localStorage.setItem("registry_images", JSON.stringify(next));
                return next;
              });
              toast.success("Uploaded file + GPS attached");
              setLoadingGeo(false);
            },
            (err) => {
              const newImg = {
                id: Date.now() + Math.random(),
                dataUrl,
                lat: null,
                lng: null,
                gpsError: err.message,
                timestamp: new Date().toISOString(),
              };
              setImages((prev) => {
                const next = [newImg, ...prev];
                localStorage.setItem("registry_images", JSON.stringify(next));
                return next;
              });
              toast.error("Uploaded but GPS not available");
              setLoadingGeo(false);
            }
          );
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem("registry_images", JSON.stringify(next));
      return next;
    });
  };

  // ---------- WALLET ----------
  const handleConnectWallet = async () => {
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);

      const userObj = {
        _id: address,
        name: ngo.name,
        email: ngo.email,
        walletAddress: address,
      };
      localStorage.setItem("user", JSON.stringify(userObj));

      setNgo((prev) => ({ ...prev, walletAddress: address }));
      toast.success(`Wallet connected: ${address.slice(0, 6)}...`);
    } catch (err) {
      toast.error("Wallet connection failed: " + err.message);
    }
  };

  // ---------- PINATA ----------
  function dataURLtoFile(dataUrl, filename) {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  async function uploadImagesToPinata(images) {
    const ipfsHashes = [];
    for (let i = 0; i < images.length; i++) {
      const file = dataURLtoFile(images[i].dataUrl, `image_${i}.jpg`);
      try {
        const result = await pinata.upload.public.file(file, {
          name: `image_${i}.jpg`,
        });
        ipfsHashes.push(result.cid);
      } catch {
        ipfsHashes.push(null);
      }
    }
    return ipfsHashes;
  }

  // ---------- SUBMIT ----------
  const handleSubmitProject = async () => {
    try {
      if (!ngo.name || !ngo.email || !ngo.location) {
        toast.error("Fill NGO details");
        return;
      }
      if (!project.title || !project.treesPlanted) {
        toast.error("Fill project details");
        return;
      }
      if (images.length === 0) {
        toast.error("Add at least one image");
        return;
      }

      const ipfsHashes = await uploadImagesToPinata(images);

      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser._id) {
        toast.error("User not logged in properly");
        return;
      }

      const payload = {
        ngoId: storedUser._id,
        ngoName: ngo.name,
        email: ngo.email,
        projectData: {
          projectId: "proj_" + Date.now(),
          title: project.title,
          description: project.description,
          location: project.location,
          ecosystem: project.ecosystem,
          treesPlanted: Number(project.treesPlanted),
          areaRestored: Number(project.areaRestored || 0),
          carbonStored: Number(project.carbonStored || 0),
          ipfsImages: ipfsHashes,
          ngoWallet: walletAddress || storedUser.walletAddress || "",
        },
        images: images.map((img, idx) => ({
          ipfsHash: ipfsHashes[idx],
          lat: img.lat ?? 0,
          lng: img.lng ?? 0,
          timestamp: img.timestamp ? new Date(img.timestamp) : new Date(),
          onChainIndex: idx,
        })),
      };

      const response = await axios.post("/api/user/projects", payload, {
        timeout: 20000,
      });

      if (response.data.success) {
        toast.success("Project submitted!");
        localStorage.removeItem("registry_ngo");
        localStorage.removeItem("registry_project");
        localStorage.removeItem("registry_images");
        setStep(1);
        setNgo({ name: "", email: "", location: "" });
        setProject({
          title: "",
          ecosystem: "Mangrove",
          location: "",
          treesPlanted: "",
          areaRestored: "",
          carbonStored: "",
          description: "",
        });
        setImages([]);
      } else {
        toast.error("Submission failed: " + response.data.message);
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-500 to-green-600 rounded-b-3xl text-white py-16 text-center shadow-md">
        <h1 className="text-5xl font-bold mb-4n playfont italic my-5">
          Blue Carbon Project Registry
        </h1>
        <p className="text-sm max-w-2xl mx-auto playfont italic my-5">
          Submit, verify, and track NGO-led projects that help restore
          ecosystems and capture carbon. Together we make climate action
          transparent.
        </p>
      </section>

      <div className="max-w-5xl my-20 mx-auto p-6 flex-1">
        {/* Step Indicator */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-8 gap-6 md:gap-0">
          {["NGO Details", "Project Details", "Upload & Capture"].map(
            (label, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row items-center text-center md:text-left"
              >
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-semibold
          ${
            step === i + 1
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
                >
                  {i + 1}
                </div>

                {/* Label */}
                <span className="mt-2 md:mt-0 md:mx-3 font-medium text-sm md:text-base">
                  {label}
                </span>

                {/* Line (only between steps) */}
                {i < 2 && (
                  <div className="hidden md:block w-12 h-0.5 bg-gray-300"></div>
                )}
                {i < 2 && (
                  <div className="block md:hidden h-8 w-0.5 bg-gray-300 mx-auto"></div>
                )}
              </div>
            )
          )}
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          {step === 1 && (
            <>
              {/* Title */}
              <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-2 text-green-700">
                <User className="w-6 h-6 text-green-600" /> NGO / User Details
              </h2>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                {/* NGO Name */}
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 text-green-600" /> NGO Name
                  </label>
                  <input
                    className="border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                    value={ngo.name}
                    onChange={(e) => setNgo({ ...ngo, name: e.target.value })}
                    placeholder="Enter NGO Name"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 text-green-600" /> Email
                  </label>
                  <input
                    className="border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                    value={ngo.email}
                    onChange={(e) => setNgo({ ...ngo, email: e.target.value })}
                    placeholder="Enter Email"
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 text-green-600" /> Location
                  </label>
                  <input
                    className="border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                    value={ngo.location}
                    onChange={(e) =>
                      setNgo({ ...ngo, location: e.target.value })
                    }
                    placeholder="Enter Location"
                  />
                </div>

                {/* Wallet */}
                <div className="flex flex-col md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Wallet className="w-4 h-4 text-green-600" /> Wallet Address
                  </label>
                  <input
                    className="border rounded-lg p-2.5 w-full bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed"
                    value={walletAddress || ""}
                    readOnly
                    placeholder="Connect wallet"
                  />
                  <button
                    className="mt-3 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-fit shadow-md"
                    onClick={handleConnectWallet}
                  >
                    {walletAddress ? "Reconnect Wallet" : "Connect Wallet"}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="px-5 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm"
                  onClick={() =>
                    localStorage.setItem("registry_ngo", JSON.stringify(ngo))
                  }
                >
                  Save Draft
                </button>
                <button
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
                  onClick={saveNgoAndNext}
                >
                  Save & Next
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Project Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
                  <FileText className="w-4 h-4" /> Project Title
                </label>
                <input
                  className="border rounded p-2 md:col-span-2"
                  value={project.title}
                  onChange={(e) =>
                    setProject({ ...project, title: e.target.value })
                  }
                  placeholder="Enter Project Title"
                />
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Leaf className="w-4 h-4" /> Ecosystem
                </label>
                <select
                  className="border rounded p-2"
                  value={project.ecosystem}
                  onChange={(e) =>
                    setProject({ ...project, ecosystem: e.target.value })
                  }
                >
                  <option>Mangrove</option>
                  <option>Seagrass</option>
                  <option>Salt Marsh</option>
                  <option>Other</option>
                </select>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4" /> Location
                </label>
                <input
                  className="border rounded p-2"
                  value={project.location}
                  onChange={(e) =>
                    setProject({ ...project, location: e.target.value })
                  }
                  placeholder="Enter Location"
                />
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Trees className="w-4 h-4" /> Trees Planted
                </label>
                <input
                  type="number"
                  className="border rounded p-2"
                  value={project.treesPlanted}
                  onChange={(e) =>
                    setProject({ ...project, treesPlanted: e.target.value })
                  }
                  placeholder="Enter number of trees planted"
                />
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Ruler className="w-4 h-4" /> Area Restored (ha)
                </label>
                <input
                  type="number"
                  className="border rounded p-2"
                  value={project.areaRestored}
                  onChange={(e) =>
                    setProject({ ...project, areaRestored: e.target.value })
                  }
                  placeholder="Enter area restored in hectares"
                />
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Box className="w-4 h-4" /> Estimated Carbon Stored
                </label>
                <input
                  className="border rounded p-2"
                  value={project.carbonStored}
                  onChange={(e) =>
                    setProject({ ...project, carbonStored: e.target.value })
                  }
                  placeholder="Enter carbon estimate"
                />
                <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
                  <FileText className="w-4 h-4" /> Project Description
                </label>
                <textarea
                  className="border rounded p-2 md:col-span-2"
                  rows={4}
                  value={project.description}
                  onChange={(e) =>
                    setProject({ ...project, description: e.target.value })
                  }
                  placeholder="Describe your project"
                />
              </div>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={goBack}
                >
                  Back
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={saveProjectAndNext}
                >
                  Save & Next
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CloudUpload className="w-5 h-5" /> Upload & Capture
              </h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="border rounded overflow-hidden mb-3">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={webcamConstraints}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                      onClick={handleCapture}
                      disabled={loadingGeo}
                    >
                      <Camera className="w-4 h-4" />
                      {loadingGeo ? "Capturing..." : "Capture Photo"}
                    </button>
                    <label className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 transition flex items-center gap-2">
                      <CloudUpload className="w-4 h-4" /> Upload Files
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Images</h3>
                  {images.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No images yet. Capture or upload.
                    </p>
                  )}
                  <div className="space-y-3">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="flex gap-3 border rounded p-2"
                      >
                        <img
                          src={img.dataUrl}
                          alt="capture"
                          className="w-24 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {new Date(img.timestamp).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            GPS:{" "}
                            {img.lat !== null
                              ? `${img.lat.toFixed(4)}, ${img.lng.toFixed(4)}`
                              : img.gpsError || "N/A"}
                          </div>
                          <button
                            className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            onClick={() => handleRemoveImage(img.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={goBack}
                >
                  Back
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleSubmitProject}
                >
                  Submit Project
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="text-center text-sm text-gray-500 py-6">
        Note: Admin verification & AI tree-counting modules will update project
        status later.
      </footer>
    </div>
  );
}
