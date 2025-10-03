"use client"

import { siteConfig } from "@/config/siteConfig"
import { Badge } from "@/components/shared/Badge"
import SmartSimpleBrilliant from "@/components/smart-simple-brilliant"
import YourWorkInSync from "@/components/your-work-in-sync"
import EffortlessIntegration from "@/components/effortless-integration-updated"
import NumbersThatSpeak from "@/components/numbers-that-speak"

export function Features() {
  const { bentoGrid } = siteConfig

  return (
    <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
      <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
          <Badge
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                <rect x="7" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                <rect x="1" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                <rect x="7" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
              </svg>
            }
            text={bentoGrid.badge.text}
          />
          <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
            {bentoGrid.title}
          </div>
          <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
            {bentoGrid.description.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < bentoGrid.description.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="self-stretch flex justify-center items-start">
        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 200 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              />
            ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-r border-[rgba(55,50,47,0.12)]">
          {/* Top Left - Smart. Simple. Brilliant. */}
          <div className="border-b border-r-0 md:border-r border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                {bentoGrid.items[0].title}
              </h3>
              <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                {bentoGrid.items[0].description}
              </p>
            </div>
            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex items-center justify-center overflow-hidden">
              <SmartSimpleBrilliant
                width="100%"
                height="100%"
                theme="light"
                className="scale-50 sm:scale-65 md:scale-75 lg:scale-90"
              />
            </div>
          </div>

          {/* Top Right - Your work, in sync */}
          <div className="border-b border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#37322F] font-semibold leading-tight font-sans text-lg sm:text-xl">
                {bentoGrid.items[1].title}
              </h3>
              <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                {bentoGrid.items[1].description}
              </p>
            </div>
            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden text-right items-center justify-center">
              <YourWorkInSync width="400" height="250" theme="light" className="scale-60 sm:scale-75 md:scale-90" />
            </div>
          </div>

          {/* Bottom Left - Effortless integration */}
          <div className="border-r-0 md:border-r border-[rgba(55,50,47,0.12)] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 bg-transparent">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                {bentoGrid.items[2].title}
              </h3>
              <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                {bentoGrid.items[2].description}
              </p>
            </div>
            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden justify-center items-center relative bg-transparent">
              <div className="w-full h-full flex items-center justify-center bg-transparent">
                <EffortlessIntegration width={400} height={250} className="max-w-full max-h-full" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F7F5F3] to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Bottom Right - Numbers that speak */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#37322F] text-lg sm:text-xl font-semibold leading-tight font-sans">
                {bentoGrid.items[3].title}
              </h3>
              <p className="text-[#605A57] text-sm md:text-base font-normal leading-relaxed font-sans">
                {bentoGrid.items[3].description}
              </p>
            </div>
            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <NumbersThatSpeak
                  width="100%"
                  height="100%"
                  theme="light"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F7F5F3] to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>

        <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
          <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
            {Array.from({ length: 200 }).map((_, i) => (
              <div
                key={i}
                className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
