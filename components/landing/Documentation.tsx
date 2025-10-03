"use client"

import { useState, useEffect } from "react"
import { siteConfig } from "@/config/siteConfig"
import { Badge } from "@/components/shared/Badge"

export function Documentation() {
  const [activeCard, setActiveCard] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)

  const { documentation } = siteConfig

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % documentation.features.length)
      setAnimationKey((prev) => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [documentation.features.length])

  const handleCardClick = (index: number) => {
    setActiveCard(index)
    setAnimationKey((prev) => prev + 1)
  }

  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4 shadow-none">
          <Badge
            icon={
              <div className="w-[10.50px] h-[10.50px] outline outline-[1.17px] outline-[#37322F] outline-offset-[-0.58px] rounded-full"></div>
            }
            text={documentation.badge.text}
          />
          <div className="self-stretch text-center flex justify-center flex-col text-[#49423D] text-3xl md:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
            {documentation.title}
          </div>
          <div className="self-stretch text-center text-[#605A57] text-base font-normal leading-7 font-sans">
            {documentation.description.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < documentation.description.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="self-stretch px-4 md:px-9 overflow-hidden flex justify-start items-center">
        <div className="flex-1 py-8 md:py-11 flex flex-col md:flex-row justify-start items-center gap-6 md:gap-12">
          <div className="w-full md:w-auto md:max-w-[400px] flex flex-col justify-center items-center gap-4 order-2 md:order-1">
            {documentation.features.map((feature, index) => {
              const isActive = index === activeCard

              return (
                <div
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className={`w-full overflow-hidden flex flex-col justify-start items-start transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]"
                      : "border border-[rgba(2,6,23,0.08)]"
                  }`}
                >
                  <div
                    className={`w-full h-0.5 bg-[rgba(50,45,43,0.08)] overflow-hidden ${isActive ? "opacity-100" : "opacity-0"}`}
                  >
                    <div
                      key={animationKey}
                      className="h-0.5 bg-[#322D2B] animate-[progressBar_5s_linear_forwards] will-change-transform"
                    />
                  </div>
                  <div className="px-6 py-5 w-full flex flex-col gap-2">
                    <div className="self-stretch flex justify-center flex-col text-[#49423D] text-sm font-semibold leading-6 font-sans">
                      {feature.title}
                    </div>
                    <div className="self-stretch text-[#605A57] text-[13px] font-normal leading-[22px] font-sans whitespace-pre-line">
                      {feature.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="w-full md:w-auto rounded-lg flex flex-col justify-center items-center gap-2 order-1 md:order-2 md:px-0 px-[00]">
            <div className="w-full md:w-[580px] h-[250px] md:h-[420px] bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-lg flex flex-col justify-start items-start">
              <div
                className={`w-full h-full transition-all duration-300 ${
                  activeCard === 0
                    ? "bg-gradient-to-br from-blue-50 to-blue-100"
                    : activeCard === 1
                      ? "bg-gradient-to-br from-purple-50 to-purple-100"
                      : "bg-gradient-to-br from-green-50 to-green-100"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progressBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  )
}
