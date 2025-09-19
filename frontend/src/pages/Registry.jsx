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
import EcoLoader from "../components/EcoLoader";

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
  const [videos, setVideos] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [videoStream, setVideoStream] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [plantCounts, setPlantCounts] = useState({});

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

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("video/")) {
        toast.error("Only video files allowed");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const videoUrl = reader.result;
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const newVid = {
                id: Date.now() + Math.random(),
                dataUrl: videoUrl,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                timestamp: new Date().toISOString(),
              };
              setVideos((prev) => {
                const next = [newVid, ...prev];
                return next;
              });
              toast.success("Video uploaded + GPS attached");
            },
            () => {
              const newVid = {
                id: Date.now() + Math.random(),
                dataUrl: videoUrl,
                lat: null,
                lng: null,
                timestamp: new Date().toISOString(),
              };
              setVideos((prev) => {
                const next = [newVid, ...prev];
                localStorage.setItem("registry_videos", JSON.stringify(next));
                return next;
              });
              toast.error("Video uploaded (GPS unavailable)");
            }
          );
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };
  const handleRemoveVideo = (id) => {
    setVideos((prev) => {
      const next = prev.filter((v) => v.id !== id);
      localStorage.setItem("registry_videos", JSON.stringify(next));
      return next;
    });
  };

  async function uploadVideosToPinata(videos) {
    const ipfsHashes = [];
    for (let i = 0; i < videos.length; i++) {
      const file =
        videos[i].file || dataURLtoFile(videos[i].dataUrl, `video_${i}.mp4`);
      if (!file) {
        ipfsHashes.push(null); // skip invalid files
        continue;
      }
      try {
        const result = await pinata.upload.public.file(file, {
          name: `video_${i}.mp4`,
        });
        ipfsHashes.push(result.cid);
      } catch (err) {
        console.error("Video upload failed:", err);
        ipfsHashes.push(null);
      }
    }
    return ipfsHashes;
  }

  // ---------- PINATA ----------
  function dataURLtoFile(dataUrl, filename) {
    try {
      if (!dataUrl || typeof dataUrl !== "string") return null;
      const arr = dataUrl.split(",");
      if (arr.length !== 2 || !arr[1]) return null;
      const mimeMatch = arr[0].match(/data:(.*?);base64/);
      if (!mimeMatch || !mimeMatch[1]) return null;
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);
      for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
      return new File([u8arr], filename, { type: mime });
    } catch (err) {
      console.error("dataURLtoFile error:", err);
      return null;
    }
  }

  async function uploadImagesToPinata(images) {
    const ipfsHashes = [];
    for (let i = 0; i < images.length; i++) {
      const file = dataURLtoFile(images[i].dataUrl, `image_${i}.jpg`);
      if (!file) {
        ipfsHashes.push(null); // skip invalid images
        continue;
      }
      try {
        const result = await pinata.upload.public.file(file, {
          name: `image_${i}.jpg`,
        });
        ipfsHashes.push(result.cid);
      } catch (err) {
        console.error("Image upload failed:", err);
        ipfsHashes.push(null);
      }
    }
    return ipfsHashes;
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: true,
      });

      setVideoStream(stream);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      let chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        chunks = [];

        const videoUrl = URL.createObjectURL(blob);

        // Convert blob to File for Pinata upload
        const file = new File([blob], `video_${Date.now()}.webm`, {
          type: "video/webm",
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const newVid = {
                id: Date.now(),
                dataUrl: videoUrl,
                file,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                timestamp: new Date().toISOString(),
              };
              setVideos((prev) => {
                const next = [newVid, ...prev];
                return next;
              });
              toast.success("Recorded video + GPS attached");
            },
            () => {
              toast.error("Video recorded but GPS not available");
            }
          );
        }
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      toast.success("Recording started");
    } catch (err) {
      toast.error("Error starting recording: " + err.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);

    // stop the webcam stream
    videoStream.getTracks().forEach((track) => track.stop());
  };

  const countPlantsInVideo = async (videoFile) => {
    return new Promise((resolve, reject) => {
      if (!window.cv) return reject("OpenCV.js not loaded");

      const video = document.createElement("video");
      video.src = URL.createObjectURL(videoFile);
      video.crossOrigin = "anonymous";
      video.muted = true;

      video.onloadedmetadata = () => {
        video.width = 640;
        video.height = 360;
        video.play();

        const cap = new cv.VideoCapture(video);
        const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        const gray = new cv.Mat();
        const blurred = new cv.Mat();
        const thresh = new cv.Mat();
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        let totalCount = 0;
        let framesProcessed = 0;

        const processFrame = () => {
          if (video.ended || framesProcessed > 100) {
            // limit frames for performance
            src.delete();
            gray.delete();
            blurred.delete();
            thresh.delete();
            contours.delete();
            hierarchy.delete();
            resolve(Math.round(totalCount / framesProcessed)); // average count
            return;
          }

          cap.read(src);
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
          cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
          cv.threshold(
            blurred,
            thresh,
            100,
            255,
            cv.THRESH_BINARY_INV + cv.THRESH_OTSU
          );
          cv.findContours(
            thresh,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE
          );

          let frameCount = 0;
          for (let i = 0; i < contours.size(); i++) {
            if (cv.contourArea(contours.get(i)) > 200) frameCount++;
          }

          totalCount += frameCount;
          framesProcessed++;

          requestAnimationFrame(processFrame);
        };

        processFrame();
      };
    });
  };
  const countPlantsInImage = async (imageFile) => {
    return new Promise((resolve, reject) => {
      if (!window.cv) return reject("OpenCV.js not loaded");

      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const src = cv.imread(img);
        const gray = new cv.Mat();
        const blurred = new cv.Mat();
        const thresh = new cv.Mat();
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        cv.threshold(
          blurred,
          thresh,
          100,
          255,
          cv.THRESH_BINARY_INV + cv.THRESH_OTSU
        );
        cv.findContours(
          thresh,
          contours,
          hierarchy,
          cv.RETR_EXTERNAL,
          cv.CHAIN_APPROX_SIMPLE
        );

        let count = 0;
        let unwantedDetected = false;

        for (let i = 0; i < contours.size(); i++) {
          if (cv.contourArea(contours.get(i)) > 200) {
            // Get bounding rect for this contour
            let rect = cv.boundingRect(contours.get(i));
            let roi = src.roi(rect);

            // Convert ROI to HSV for color filtering
            let hsv = new cv.Mat();
            cv.cvtColor(roi, hsv, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

            // Define green color range
            let lowGreen = new cv.Mat(
              hsv.rows,
              hsv.cols,
              hsv.type(),
              [35, 40, 40, 0]
            );
            let highGreen = new cv.Mat(
              hsv.rows,
              hsv.cols,
              hsv.type(),
              [85, 255, 255, 255]
            );
            let mask = new cv.Mat();
            cv.inRange(hsv, lowGreen, highGreen, mask);

            // Calculate % of green pixels
            let greenPixels = cv.countNonZero(mask);
            let totalPixels = roi.rows * roi.cols;
            let greenRatio = greenPixels / totalPixels;

            if (greenRatio > 0.3) {
              // Mostly green → assume plant
              count++;
            } else {
              // Not green enough → unwanted object
              unwantedDetected = true;
            }

            roi.delete();
            hsv.delete();
            lowGreen.delete();
            highGreen.delete();
            mask.delete();
          }
        }

        src.delete();
        gray.delete();
        blurred.delete();
        thresh.delete();
        contours.delete();
        hierarchy.delete();

        if (unwantedDetected) {
          toast.custom("⚠️ Unwanted object found!");
        }

        resolve(count);
      };

      img.onerror = (err) => reject(err);
    });
  };

  // ---------- SUBMIT PROJECT ----------
  const handleSubmitProject = async () => {
    try {
      const plantCount = Object.values(plantCounts).pop() ?? null;
      const manualCount = Number(project.treesPlanted);

      // ✅ Handle missing OpenCV count
      if (plantCount === null) {
        toast.error(
          `Please check plant count before submitting. Manual count: ${manualCount}`
        );
        return;
      }

      // ✅ Combine both counts into one final count
      let finalPlantCount;
      if (manualCount && plantCount) {
        finalPlantCount = Math.round((manualCount + plantCount) / 2);
      } else if (manualCount) {
        finalPlantCount = manualCount;
      } else {
        finalPlantCount = plantCount;
      }

      // ✅ Validate difference tolerance (70%–130%)
      const accuracy = (plantCount / manualCount) * 100;
      if (accuracy < 70 || accuracy > 130) {
        toast.error(
          `Mismatch detected! Manual: ${manualCount}, OpenCV: ${plantCount}, Final: ${finalPlantCount}`
        );
        return;
      }

      // ✅ Validate NGO Details
      if (!ngo.name || !ngo.email || !ngo.location) {
        toast.error("Fill NGO details");
        return;
      }

      // ✅ Validate Project Details
      if (!project.title) {
        toast.error("Fill project details");
        return;
      }

      // ✅ Validate Media
      if (images.length === 0 && videos.length === 0) {
        toast.error("Add at least one image or video");
        return;
      }

      setSubmitting(true);

      // -------------------- UPLOAD MEDIA TO PINATA --------------------
      const ipfsImageHashes =
        images.length > 0 ? await uploadImagesToPinata(images) : [];
      const ipfsVideoHashes =
        videos.length > 0 ? await uploadVideosToPinata(videos) : [];

      // ✅ Get logged-in user
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser._id) {
        toast.error("User not logged in properly");
        setSubmitting(false);
        return;
      }

      // -------------------- PREPARE PAYLOAD --------------------
      const projectId = "proj_" + Date.now();
      const payload = {
        ngoId: storedUser._id,
        ngoName: ngo.name,
        email: ngo.email,
        projectData: {
          projectId,
          title: project.title,
          description: project.description,
          location: project.location,
          ecosystem: project.ecosystem,
          treesPlanted: finalPlantCount, // ✅ Save final count
          manualCount,
          openCvCount: plantCount,
          areaRestored: Number(project.areaRestored || 0),
          carbonStored: Number(project.carbonStored || 0),
          ipfsImages: ipfsImageHashes,
          ngoWallet: walletAddress || storedUser.walletAddress || "",
        },
        images: images.map((img, idx) => ({
          ipfsHash: ipfsImageHashes[idx],
          lat: img.lat ?? 0,
          lng: img.lng ?? 0,
          timestamp: img.timestamp ? new Date(img.timestamp) : new Date(),
          onChainIndex: idx,
          type: "image",
        })),
        videos: videos.map((vid, idx) => ({
          ipfsHash: ipfsVideoHashes[idx],
          lat: vid.lat ?? 0,
          lng: vid.lng ?? 0,
          timestamp: vid.timestamp ? new Date(vid.timestamp) : new Date(),
          onChainIndex: idx,
          type: "video",
        })),
      };

      // -------------------- POST TO BACKEND --------------------
      const response = await axios.post("/api/user/projects", payload, {
        timeout: 30000,
      });

      if (response.data.success) {
        toast.success(
          `Project submitted successfully! 🌱 Final Plant Count: ${finalPlantCount}`
        );

        // ✅ Clear local draft
        [
          "registry_ngo",
          "registry_project",
          "registry_images",
          "registry_videos",
        ].forEach((key) => localStorage.removeItem(key));

        // ✅ Reset state
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
        setVideos([]);
      } else {
        toast.error(
          "Submission failed: " + (response.data.message || "Unknown error")
        );
      }
    } catch (err) {
      console.error("handleSubmitProject error:", err);
      toast.error("Error submitting project: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!window.cv) {
      const script = document.createElement("script");
      script.src = "https://docs.opencv.org/4.x/opencv.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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
                {/* Image Capture & Upload */}
                <div>
                  <div className="border rounded overflow-hidden mb-3">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={webcamConstraints}
                    />
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {/* Capture Image */}
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                      onClick={handleCapture}
                      disabled={loadingGeo}
                    >
                      <Camera className="w-4 h-4" />
                      {loadingGeo ? "Capturing..." : "Capture Photo"}
                    </button>

                    {/* Upload Images */}
                    <label className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 transition flex items-center gap-2">
                      <CloudUpload className="w-4 h-4" /> Upload Images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Upload Videos */}
                    <label className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 transition flex items-center gap-2">
                      <CloudUpload className="w-4 h-4" /> Upload Videos
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Record Video */}
                    {!recording ? (
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                        onClick={startRecording}
                      >
                        🎥 Start Recording
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
                        onClick={stopRecording}
                      >
                        ⏹ Stop Recording
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Previews */}
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

                          <div className="flex gap-2 mt-2">
                            <button
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              onClick={() => handleRemoveImage(img.id)}
                            >
                              Remove
                            </button>

                            <button
                              className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                              onClick={async () => {
                                toast.loading("Counting plants in image...");
                                try {
                                  const detectedCount =
                                    await countPlantsInImage(
                                      dataURLtoFile(img.dataUrl, "image.jpg")
                                    );
                                  setPlantCounts((prev) => ({
                                    ...prev,
                                    [img.id]: detectedCount,
                                  }));
                                  toast.dismiss();
                                  toast.success(
                                    `Detected Plant Count: ${detectedCount}`
                                  );
                                } catch (err) {
                                  toast.dismiss();
                                  toast.error("Error counting plants: " + err);
                                }
                              }}
                            >
                              Check Plant Count
                            </button>
                          </div>

                          {plantCounts[img.id] !== undefined && (
                            <div className="mt-2 text-green-700 font-semibold">
                              🌱 OpenCV Detected: {plantCounts[img.id]} plants
                              <br />
                              ✍️ Manual Entry: {project.treesPlanted}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Previews */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Videos</h3>
                {videos.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No videos yet. Upload or record.
                  </p>
                )}
                <div className="space-y-3">
                  {videos.map((vid) => (
                    <div
                      key={vid.id}
                      className="flex flex-col gap-2 border rounded p-2"
                    >
                      <video
                        src={vid.dataUrl}
                        controls
                        className="w-full h-40 rounded"
                      />
                      <div className="text-xs text-gray-600">
                        GPS:{" "}
                        {vid.lat !== null
                          ? `${vid.lat.toFixed(4)}, ${vid.lng.toFixed(4)}`
                          : vid.gpsError || "N/A"}
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          onClick={() => handleRemoveVideo(vid.id)}
                        >
                          Remove
                        </button>

                        <button
                          className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                          onClick={async () => {
                            toast.loading("Counting plants in video...");
                            try {
                              const detectedCount = await countPlantsInVideo(
                                vid.file ||
                                  dataURLtoFile(vid.dataUrl, "video.mp4")
                              );
                              setPlantCounts((prev) => ({
                                ...prev,
                                [vid.id]: detectedCount,
                              }));
                              toast.dismiss();
                              toast.success(
                                `Detected Plant Count: ${detectedCount}`
                              );
                            } catch (err) {
                              toast.dismiss();
                              toast.error("Error counting plants: " + err);
                            }
                          }}
                        >
                          Check Plant Count
                        </button>
                      </div>

                      {plantCounts[vid.id] !== undefined && (
                        <div className="mt-2 text-green-700 font-semibold">
                          🌱 OpenCV Detected: {plantCounts[vid.id]} plants
                          <br />
                          ✍️ Manual Entry: {project.treesPlanted}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={goBack}
                >
                  Back
                </button>
                <button
                  className={`px-4 py-2 rounded hover:bg-blue-700 ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white"
                  }`}
                  onClick={handleSubmitProject}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Project"}
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
      {submitting && <EcoLoader />}
    </div>
  );
}
