"use client";

import Link from "next/link";
import MatrixBackground from "@/components/ui/matrix-background";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center">
      <MatrixBackground />
      
      <div className="text-center z-10 relative">
        <div className="mb-8">
          <h1 className="text-green-400 font-mono text-8xl md:text-9xl lg:text-[12rem] font-bold">
            404
          </h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            PAGE NOT FOUND
          </h2>
          <p className="text-gray-400 text-base md:text-lg lg:text-xl">
            The page you&apos;re looking for doesn&apos;t exist in the matrix.
          </p>
        </div>
        
        <div>
          <Link href="/">
            <button className="ascii-button">
              <span className="ascii-button-text">RETURN HOME</span>
            </button>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .ascii-button {
          position: relative;
          background: #000;
          border: none;
          color: #00ff00;
          padding: 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: translateY(0);
          box-shadow: 
            0 0 0 2px #000,
            0 0 0 4px #00ff00,
            0 8px 0 0 #00aa00,
            0 8px 0 2px #000,
            0 8px 0 4px #00ff00;
          line-height: 1.2;
        }

        .ascii-button:hover {
          transform: translateY(2px);
          box-shadow: 
            0 0 0 2px #000,
            0 0 0 4px #00ff00,
            0 6px 0 0 #00aa00,
            0 6px 0 2px #000,
            0 6px 0 4px #00ff00;
          background: #001100;
        }

        .ascii-button:active {
          transform: translateY(6px);
          box-shadow: 
            0 0 0 2px #000,
            0 0 0 4px #00ff00,
            0 2px 0 0 #00aa00,
            0 2px 0 2px #000,
            0 2px 0 4px #00ff00;
        }

        .ascii-button-text {
          position: relative;
          z-index: 2;
          margin: 0;
          padding: 8px 12px;
          background: #000;
          border: none;
          outline: none;
          white-space: pre;
          text-align: center;
          display: block;
        }

        .ascii-button::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          opacity: 0.3;
          transition: opacity 0.3s ease;
          background: linear-gradient(45deg, #00ff00, #00aa00, #00ff00);
        }

        .ascii-button:hover::before {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
