"use client";
import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#F7F5F3] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Container */}
        <div className="relative">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#37322f]/5 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#8b7d70]/5 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          {/* Content Card */}
          <div className=" p-8 sm:p-12 ">
            {/* 404 Number */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#37322f] to-[#5a5550] shadow-lg mb-6 ">
                <span className="text-4xl sm:text-5xl font-bold text-white">
                  404
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#37322f] text-center mb-4 tracking-tight">
              Page Not Found
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#8b7d70] text-center mb-8 max-w-md mx-auto leading-relaxed">
              Oops! The page you&apos;re looking for seems to have wandered off
              into the mathematical void.
            </p>

            {/* Illustration */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-gradient-to-br from-[#fdfcfb] to-[#f7f5f3] border border-[#e8e4df] flex items-center justify-center shadow-sm">
                  {/* Math symbols floating around */}
                  <div className="relative">
                    <div className="text-6xl sm:text-7xl text-[#37322f]/10 font-serif">
                      ∫
                    </div>
                    <div className="absolute -top-4 -right-8 text-3xl text-[#8b7d70]/20 animate-float">
                      π
                    </div>
                    <div
                      className="absolute -bottom-4 -left-8 text-3xl text-[#8b7d70]/20 animate-float"
                      style={{ animationDelay: "0.5s" }}
                    >
                      ∑
                    </div>
                    <div
                      className="absolute top-0 -left-12 text-2xl text-[#8b7d70]/20 animate-float"
                      style={{ animationDelay: "1s" }}
                    >
                      ∞
                    </div>
                    <div
                      className="absolute -bottom-2 -right-10 text-2xl text-[#8b7d70]/20 animate-float"
                      style={{ animationDelay: "1.5s" }}
                    >
                      √
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#37322f] to-[#4a443f] hover:from-[#4a443f] hover:to-[#37322f] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Icon
                  name="back"
                  className="size-5 group-hover:-translate-x-1 transition-transform duration-200"
                />
                <span>Back to Home</span>
              </Link>

              <Link
                href="/chat"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-[#e8e4df]  text-[#37322f] font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <Icon
                  name="newThread"
                  className="size-5 transition-transform duration-200"
                />
                <span>Start Chat</span>
              </Link>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-[#8b7d70]/60">
              Error Code: 404 • Page Not Found
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
