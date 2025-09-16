import React from "react";

export default function EcoLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      {/* Loader Container */}
      <div className="relative w-40 h-40">
        {/* 3D Rotating Leaf Fun */}
        <div id="box">
          <div id="base">
            <div id="tail"></div>
            <div id="leafbase">
              <div id="lf">
                <div id="leaf1">
                  <div className="leaf11"></div>
                  <div className="leaf12"></div>
                </div>
                <div id="leaf2">
                  <div className="leaf11"></div>
                  <div className="leaf12"></div>
                </div>
                <div id="leaf3">
                  <div className="leaf11"></div>
                  <div className="leaf12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Leaf CSS */}
      <style jsx>{`
        #base {
          position: absolute;
          height: 10px;
          width: 10px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: animb 5s infinite linear;
        }
        @keyframes animb {
          0% {
            top: 50%;
          }
          25% {
            top: 48%;
          }
          50% {
            top: 50%;
          }
          75% {
            top: 52%;
          }
          100% {
            top: 50%;
          }
        }
        #leafbase {
          transform-style: preserve-3d;
          position: absolute;
          height: 100px;
          width: 100px;
          top: 50%;
          left: 50%;
          transform-origin: 0% 0%;
          transform: translate(-50%, -50%) rotateX(55deg) rotateY(20deg);
        }
        #tail {
          transform-style: preserve-3d;
          perspective: 1000px;
          position: absolute;
          height: 100px;
          width: 100px;
          top: 50%;
          left: 50%;
          overflow: hidden;
          transform: translate(-50%, 0%);
        }
        #tail:after {
          content: "";
          margin-top: -5px;
          position: absolute;
          height: 100px;
          width: 20px;
          left: 33%;
          border-radius: 100%;
          border-right: 5px solid #658500;
          transform-origin: 0% -0%;
          transform: rotate(25deg);
        }
        #lf {
          transform-style: preserve-3d;
          position: absolute;
          height: 100px;
          width: 100px;
          top: 50%;
          left: 50%;
          transform-origin: 0% 0%;
          animation: anim 1.5s infinite linear;
        }
        #leaf1,
        #leaf2,
        #leaf3 {
          transform-style: preserve-3d;
          position: absolute;
          width: 60px;
          height: 60px;
          left: 50%;
          top: 50%;
          transform-origin: 0% 0%;
        }
        #leaf1 {
          transform: translate(-50%, -100%);
        }
        #leaf2 {
          transform: rotate(120deg) translate(-50%, -100%);
        }
        #leaf3 {
          transform: rotate(240deg) translate(-50%, -100%);
        }

        @keyframes anim {
          0% {
            transform: rotateZ(0deg) translate(-50%, -50%);
          }
          100% {
            transform: rotateZ(360deg) translate(-50%, -50%);
          }
        }

        .leaf12 {
          margin-top: -5px;
          position: absolute;
          left: 29px;
          height: 70px;
          width: 32px;
          overflow: hidden;
          transform-style: preserve-3d;
          transform: rotateY(-15deg);
        }
        .leaf12:after {
          content: "";
          position: absolute;
          left: -15px;
          border-top-left-radius: 30px;
          border-top-right-radius: 50px;
          width: 40px;
          height: 60px;
          background-color: #658500;
          transform: rotate(45deg);
        }
        .leaf11 {
          margin-top: -5px;
          position: absolute;
          right: 29px;
          height: 70px;
          width: 30px;
          overflow: hidden;
          transform-style: preserve-3d;
          transform: rotateY(15deg);
        }
        .leaf11:after {
          content: "";
          position: absolute;
          right: -15px;
          border-top-left-radius: 50px;
          border-top-right-radius: 30px;
          width: 40px;
          height: 60px;
          background-color: #77a101;
          transform: rotate(-45deg);
        }
      `}</style>
    </div>
  );
}
