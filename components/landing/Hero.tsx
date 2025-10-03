"use client"

import { useState, useEffect, useRef } from "react"
import { siteConfig } from "@/config/siteConfig"
import { FeatureCard } from "@/components/shared/FeatureCard"

export function Hero() {
  const [activeCard, setActiveCard] = useState(0)
  const [progress, setProgress] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return

      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3)
          }
          return 0
        }
        return prev + 2
      })
    }, 100)

    return () => {
      clearInterval(progressInterval)
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleCardClick = (index: number) => {
    if (!mountedRef.current) return
    setActiveCard(index)
    setProgress(0)
  }

  const { hero, features } = siteConfig

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
      <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          <div className="w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0">
            {hero.title.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < hero.title.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
          <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
            {hero.description.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < hero.description.split("\n").length - 1 && <br className="hidden sm:block" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
        <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4">
          <div className="h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center">
            <div className="w-20 sm:w-24 md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
            <div className="flex flex-col justify-center text-white text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans">
              {hero.cta.primary.text}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
        <img
          src="/mask-group-pattern.svg"
          alt=""
          className="w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
          style={{
            filter: "hue-rotate(15deg) saturate(0.7) brightness(1.2)",
          }}
        />
      </div>

      <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
        <div className="w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[695.55px] bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] flex flex-col justify-start items-start">
          <div className="self-stretch flex-1 flex justify-start items-start">
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative w-full h-full overflow-hidden">
                {hero.dashboard.images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                      activeCard === index
                        ? "opacity-100 scale-100 blur-0"
                        : "opacity-0 scale-95 blur-sm"
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className={`w-full h-full ${index === 2 ? "object-contain" : "object-cover"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch border-t border-[#E0DEDB] border-b border-[#E0DEDB] flex justify-center items-start">
        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              ></div>
            ))}
          </div>
        </div>

        <div className="flex-1 px-0 sm:px-2 md:px-0 flex flex-col md:flex-row justify-center items-stretch gap-0">
          {features.cards.map((card, index) => (
            <FeatureCard
              key={index}
              title={card.title}
              description={card.description}
              isActive={activeCard === index}
              progress={activeCard === index ? progress : 0}
              onClick={() => handleCardClick(index)}
            />
          ))}
        </div>

        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
