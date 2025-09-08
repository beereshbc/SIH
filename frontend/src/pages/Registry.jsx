import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import Navbar from "../components/Navbar";
import { pinata } from "../config/pinata";
import { connectWallet } from "../utils/wallet";
import { ethers } from "ethers";
import BlueCarbonABI from "../abi/BlueCarbon.json";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

/**
 * Registry.jsx
 * User/NGO side registry page (3 sections):
 *  1) NGO / User Details
 *  2) Project Details
 *  3) Upload & Capture (webcam + GPS)
 *
 * Features:
 *  - Save & Next buttons between steps
 *  - Capture images from webcam and attach real-time geolocation (if permitted)
 *  - Upload fallback (file input) which also attempts to attach current geolocation
 *  - Edit latitude/longitude per image (flexible & accurate)
 *  - Simple draft saving to localStorage
 *
 * Requirements: npm i react-webcam
 * (Optional later: piexifjs to write EXIF GPS into files, cloud upload to Cloudinary, backend API)
 */

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
  const [message, setMessage] = useState("");
  const [loadingGeo, setLoadingGeo] = useState(false);
  const webcamRef = useRef(null);

  // Load drafts from localStorage on mount
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

  // Helpers
  const saveNgoAndNext = () => {
    if (!ngo.name || !ngo.email) {
      setMessage("Please provide NGO name and email before next.");
      return;
    }
    localStorage.setItem("registry_ngo", JSON.stringify(ngo));
    setMessage("NGO details saved.");
    setStep(2);
  };

  const saveProjectAndNext = () => {
    if (!project.title || !project.treesPlanted) {
      setMessage("Please provide Project Title and Trees Planted before next.");
      return;
    }
    localStorage.setItem("registry_project", JSON.stringify(project));
    setMessage("Project details saved.");
    setStep(3);
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  // Capture from webcam and attach real-time GPS
  const handleCapture = () => {
    if (!webcamRef.current) {
      setMessage("Camera not available.");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setMessage(
        "Unable to capture image (no camera/screenshot). Try file upload."
      );
      return;
    }

    setLoadingGeo(true);
    // Try to get precise GPS at the moment of capture
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const newImg = {
            id: Date.now(),
            dataUrl: imageSrc,
            lat,
            lng,
            timestamp: new Date().toISOString(),
          };
          setImages((prev) => {
            const next = [newImg, ...prev];
            localStorage.setItem("registry_images", JSON.stringify(next));
            return next;
          });
          setMessage("Captured image with GPS.");
          setLoadingGeo(false);
        },
        (err) => {
          // GPS failed — still save image but mark GPS null and keep error message
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
          setMessage("Captured image but GPS not available: " + err.message);
          setLoadingGeo(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // Browser doesn't support geolocation
      const newImg = {
        id: Date.now(),
        dataUrl: imageSrc,
        lat: null,
        lng: null,
        gpsError: "geolocation_not_supported",
        timestamp: new Date().toISOString(),
      };
      setImages((prev) => {
        const next = [newImg, ...prev];
        localStorage.setItem("registry_images", JSON.stringify(next));
        return next;
      });
      setMessage(
        "Captured image, but geolocation is not supported by this browser."
      );
      setLoadingGeo(false);
    }
  };

  // File upload fallback (attach current device location if possible)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;

        // Try to attach current GPS (note: this is device GPS at upload time, not necessarily image EXIF)
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
              setMessage("Uploaded file and attached current GPS.");
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
              setMessage("Uploaded file but GPS not available: " + err.message);
              setLoadingGeo(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
          const newImg = {
            id: Date.now() + Math.random(),
            dataUrl,
            lat: null,
            lng: null,
            gpsError: "geolocation_not_supported",
            timestamp: new Date().toISOString(),
          };
          setImages((prev) => {
            const next = [newImg, ...prev];
            localStorage.setItem("registry_images", JSON.stringify(next));
            return next;
          });
          setMessage("Uploaded file, but geolocation not supported.");
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = null;
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem("registry_images", JSON.stringify(next));
      return next;
    });
  };
  const handleConnectWallet = async () => {
    try {
      const { signer, address } = await connectWallet(); // your existing utility
      setWalletAddress(address);
      setNgo({ ...ngo, walletAddress: address }); // store in NGO state
      setMessage(`Wallet connected: ${address}`);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setMessage("Wallet connection failed: " + err.message);
    }
  };

  // const handleSubmitProject = () => {
  //   if (!ngo.name || !project.title) {
  //     setMessage("Please fill NGO and project basics before submitting.");
  //     return;
  //   }

  //   const payload = {
  //     projectId: "proj_" + Date.now(),
  //     ngoId: "ngo_" + (ngo.email || "unknown"),
  //     ngoName: ngo.name,
  //     email: ngo.email,
  //     ngoLocation: ngo.location,
  //     project: { ...project },
  //     images: [...images],
  //     status: "pending",
  //     submittedAt: new Date().toISOString(),
  //   };

  //   // In a real app, call backend API here. For demo we either call onSubmit prop or console.log
  //   if (typeof onSubmit === "function") {
  //     onSubmit(payload);
  //     setMessage("Project payload sent to parent onSubmit handler.");
  //   } else {
  //     console.log("[Registry] Submit payload:", payload);
  //     setMessage("Project submit (demo) logged to console.");
  //   }

  //   // Clear draft after submit
  //   localStorage.removeItem("registry_ngo");
  //   localStorage.removeItem("registry_project");
  //   localStorage.removeItem("registry_images");

  //   // Reset
  //   setStep(1);
  //   setNgo({ name: "", email: "", location: "" });
  //   setProject({
  //     title: "",
  //     ecosystem: "Mangrove",
  //     location: "",
  //     treesPlanted: "",
  //     areaRestored: "",
  //     carbonStored: "",
  //     description: "",
  //   });
  //   setImages([]);
  // };

  // Uploaddddddddddddddddddddddddddd-----------------------

  // Convert base64 → File
  function dataURLtoFile(dataUrl, filename) {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  // Upload images to Pinata
  async function uploadImagesToPinata(images) {
    const ipfsHashes = [];
    for (let i = 0; i < images.length; i++) {
      const file = dataURLtoFile(images[i].dataUrl, `image_${i}.jpg`);
      try {
        const result = await pinata.upload.public.file(file, {
          name: `image_${i}.jpg`,
        });
        ipfsHashes.push(result.cid); // v2 uses `cid`
      } catch (err) {
        console.error("Pinata upload failed for image", i, err);
        throw err;
      }
    }
    return ipfsHashes;
  }

  const handleSubmitProject = async () => {
    try {
      if (!ngo.name || !ngo.email || !ngo.location) {
        setMessage("Please fill all NGO details before submitting.");
        return;
      }
      if (!project.title || !project.treesPlanted) {
        setMessage("Please fill project title and trees planted.");
        return;
      }
      if (images.length === 0) {
        setMessage("Please capture or upload at least one image.");
        return;
      }
      let wallet = walletAddress;
      if (!wallet) {
        const walletData = await connectWallet();
        if (!walletData) {
          console.error("⚠️ Wallet connection failed or rejected");
          return; // ⛔ Stop execution if no wallet connected
        }
        const { address } = walletData;
        wallet = address;
        setWalletAddress(wallet);
      }

      const ipfsHashes = await uploadImagesToPinata(images);

      const payload = {
        ngoId: "ngo_" + (ngo.email || Date.now()),
        ngoName: ngo.name,
        ngoLocation: ngo.location,
        email: ngo.email,
        walletAddress: wallet,
        project: {
          projectId: "proj_" + Date.now(),
          title: project.title,
          ecosystem: project.ecosystem,
          location: project.location,
          treesPlanted: Number(project.treesPlanted),
          areaRestored: Number(project.areaRestored || 0),
          carbonStored: Number(project.carbonStored || 0),
          description: project.description,
        },
        images: images.map((img, idx) => ({
          ipfsHash: ipfsHashes[idx],
          lat: img.lat ?? 0,
          lng: img.lng ?? 0,
          timestamp: img.timestamp,
          gpsError: img.gpsError || null,
          status: "pending", // 🔹 default for later verification
        })),
        submittedAt: new Date().toISOString(), // ✅ Corrected
      };

      const response = await axios.post("/api/user/projects", payload);

      if (response.data.success) {
        setMessage("✅ Project submitted successfully!");
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
        setMessage("❌ Submission failed: " + response.data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Submission error: " + err.message);
    }
  };

  // if (message) {
  //   toast.success(message);
  // }

  return (
    <div className="flex flex-col gap-y-14">
      <div>
        <Navbar />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          Blue Carbon Project Registry
        </h1>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`px-3 py-1 rounded ${
              step === 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            1. NGO Details
          </div>
          <div
            className={`px-3 py-1 rounded ${
              step === 2 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            2. Project Details
          </div>
          <div
            className={`px-3 py-1 rounded ${
              step === 3 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            3. Upload & Capture
          </div>
        </div>

        {/* STEP 1: NGO Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">NGO / User Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Name</label>
                <input
                  className="border rounded p-2 w-full"
                  value={ngo.name}
                  onChange={(e) => setNgo({ ...ngo, name: e.target.value })}
                  placeholder="Mangrove Care Foundation"
                />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input
                  className="border rounded p-2 w-full"
                  value={ngo.email}
                  onChange={(e) => setNgo({ ...ngo, email: e.target.value })}
                  placeholder="email@example.org"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm">
                  Location (district/state)
                </label>
                <input
                  className="border rounded p-2 w-full"
                  value={ngo.location}
                  onChange={(e) => setNgo({ ...ngo, location: e.target.value })}
                  placeholder="Kochi, Kerala"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => {
                  localStorage.setItem("registry_ngo", JSON.stringify(ngo));
                  setMessage("Draft saved.");
                }}
              >
                Save Draft
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={saveNgoAndNext}
              >
                Save & Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Project Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm">Project Title</label>
                <input
                  className="border rounded p-2 w-full"
                  value={project.title}
                  onChange={(e) =>
                    setProject({ ...project, title: e.target.value })
                  }
                  placeholder="Mangrove Restoration at Kochi"
                />
              </div>

              <div>
                <label className="block text-sm">Ecosystem Type</label>
                <select
                  className="border rounded p-2 w-full"
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
              </div>

              <div>
                <label className="block text-sm">
                  Location (village / district)
                </label>
                <input
                  className="border rounded p-2 w-full"
                  value={project.location}
                  onChange={(e) =>
                    setProject({ ...project, location: e.target.value })
                  }
                  placeholder="Kochi, Kerala"
                />
              </div>

              <div>
                <label className="block text-sm">Trees Planted (claimed)</label>
                <input
                  type="number"
                  className="border rounded p-2 w-full"
                  value={project.treesPlanted}
                  onChange={(e) =>
                    setProject({ ...project, treesPlanted: e.target.value })
                  }
                  placeholder="1500"
                />
              </div>

              <div>
                <label className="block text-sm">Area Restored (ha)</label>
                <input
                  type="number"
                  className="border rounded p-2 w-full"
                  value={project.areaRestored}
                  onChange={(e) =>
                    setProject({ ...project, areaRestored: e.target.value })
                  }
                  placeholder="2.5"
                />
              </div>

              <div>
                <label className="block text-sm">Estimated Carbon Stored</label>
                <input
                  className="border rounded p-2 w-full"
                  value={project.carbonStored}
                  onChange={(e) =>
                    setProject({ ...project, carbonStored: e.target.value })
                  }
                  placeholder="12 tons"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm">Project Description</label>
                <textarea
                  className="border rounded p-2 w-full"
                  rows={4}
                  value={project.description}
                  onChange={(e) =>
                    setProject({ ...project, description: e.target.value })
                  }
                  placeholder="Short project description..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={goBack}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => {
                  localStorage.setItem(
                    "registry_project",
                    JSON.stringify(project)
                  );
                  setMessage("Project draft saved.");
                }}
              >
                Save Draft
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={saveProjectAndNext}
              >
                Save & Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Upload & Capture */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload & Capture Images</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-2">Live camera (environment facing)</div>
                <div className="border rounded overflow-hidden mb-2">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={webcamConstraints}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={handleCapture}
                    disabled={loadingGeo}
                  >
                    {loadingGeo ? "Capturing..." : "Capture Photo"}
                  </button>

                  <label className="px-4 py-2 bg-gray-200 rounded cursor-pointer">
                    Upload Files
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={goBack}
                  >
                    Back
                  </button>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  Tip: Allow location access for accurate geotagging. You can
                  edit coords for each image after upload.
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Captured / Uploaded Images</h3>

                {images.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No images yet. Capture or upload to attach images with GPS.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="flex gap-3 items-start border rounded p-2"
                    >
                      <img
                        src={img.dataUrl}
                        alt="capture"
                        className="w-28 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Captured: {new Date(img.timestamp).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          GPS:{" "}
                          {img.lat !== null && img.lng !== null
                            ? `${Number(img.lat).toFixed(6)}, ${Number(
                                img.lng
                              ).toFixed(6)}`
                            : img.gpsError || "Not available"}
                        </div>

                        <div className="mt-2 flex gap-2">
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                            onClick={() => handleRemoveImage(img.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => {
                  localStorage.setItem(
                    "registry_images",
                    JSON.stringify(images)
                  );
                  setMessage("Images saved to draft.");
                }}
              >
                Save Draft
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSubmitProject}
              >
                Submit Project
              </button>
              <div className="mt-2">
                {walletAddress ? (
                  <div className="text-green-600 font-medium">
                    Wallet Connected: {walletAddress.slice(0, 6)}...
                    {walletAddress.slice(-4)}
                  </div>
                ) : (
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={handleConnectWallet}
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          Note: This is the user/NGO side. Admin verification & AI tree-counting
          modules are separate and will update project.status and per-image
          treeCount later.
        </div>
      </div>
    </div>
  );
}
