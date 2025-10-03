"use client"

import { useState } from "react"
import { siteConfig } from "@/config/siteConfig"
import { Badge } from "@/components/shared/Badge"

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually")

  const { pricing } = siteConfig

  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4 shadow-none">
          <Badge
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 1V11M8.5 3H4.75C4.28587 3 3.84075 3.18437 3.51256 3.51256C3.18437 3.84075 3 4.28587 3 4.75C3 5.21413 3.18437 5.65925 3.51256 5.98744C3.84075 6.31563 4.28587 6.5 4.75 6.5H7.25C7.71413 6.5 8.15925 6.68437 8.48744 7.01256C8.81563 7.34075 9 7.78587 9 8.25C9 8.71413 8.81563 9.15925 8.48744 9.48744C8.15925 9.81563 7.71413 10 7.25 10H3.5"
                  stroke="#37322F"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            text={pricing.badge.text}
          />

          <div className="self-stretch text-center flex justify-center flex-col text-[#49423D] text-3xl md:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
            {pricing.title}
          </div>

          <div className="self-stretch text-center text-[#605A57] text-base font-normal leading-7 font-sans">
            {pricing.description.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < pricing.description.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="self-stretch px-6 md:px-16 py-9 relative flex justify-center items-center gap-4">
        <div className="w-full max-w-[1060px] h-0 absolute left-1/2 transform -translate-x-1/2 top-[63px] border-t border-[rgba(55,50,47,0.12)] z-0"></div>

        <div className="p-3 relative bg-[rgba(55,50,47,0.03)] border border-[rgba(55,50,47,0.02)] backdrop-blur-[44px] backdrop-saturate-150 backdrop-brightness-110 flex justify-center items-center rounded-lg z-20 before:absolute before:inset-0 before:bg-white before:opacity-60 before:rounded-lg before:-z-10">
          <div className="p-[2px] bg-[rgba(55,50,47,0.10)] shadow-[0px_1px_0px_white] rounded-[99px] border-[0.5px] border-[rgba(55,50,47,0.08)] flex justify-center items-center gap-[2px] relative">
            <div
              className={`absolute top-[2px] w-[calc(50%-1px)] h-[calc(100%-4px)] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.08)] rounded-[99px] transition-all duration-300 ease-in-out ${
                billingPeriod === "annually" ? "left-[2px]" : "right-[2px]"
              }`}
            />

            <button
              onClick={() => setBillingPeriod("annually")}
              className="px-4 py-1 rounded-[99px] flex justify-center items-center gap-2 transition-colors duration-300 relative z-10 flex-1"
            >
              <div
                className={`text-[13px] font-medium leading-5 font-sans transition-colors duration-300 ${
                  billingPeriod === "annually" ? "text-[#37322F]" : "text-[#6B7280]"
                }`}
              >
                Annually
              </div>
            </button>

            <button
              onClick={() => setBillingPeriod("monthly")}
              className="px-4 py-1 rounded-[99px] flex justify-center items-center gap-2 transition-colors duration-300 relative z-10 flex-1"
            >
              <div
                className={`text-[13px] font-medium leading-5 font-sans transition-colors duration-300 ${
                  billingPeriod === "monthly" ? "text-[#37322F]" : "text-[#6B7280]"
                }`}
              >
                Monthly
              </div>
            </button>
          </div>

          {[
            [5, 5.25],
            [5, 5.25],
            [5, 5.25],
            [5, 5.25],
          ].map((_, index) => (
            <div
              key={index}
              className={`w-[3px] h-[3px] absolute ${
                index === 0
                  ? "left-[5px] top-[5.25px]"
                  : index === 1
                    ? "right-[5px] top-[5.25px]"
                    : index === 2
                      ? "left-[5px] bottom-[5.25px]"
                      : "right-[5px] bottom-[5.25px]"
              } bg-[rgba(55,50,47,0.10)] shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] rounded-[99px]`}
            ></div>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="self-stretch border-b border-t border-[rgba(55,50,47,0.12)] flex justify-center items-center">
        <div className="flex justify-center items-start w-full">
          <div className="w-12 self-stretch relative overflow-hidden hidden md:block">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                ></div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-6 py-12 md:py-0">
            {pricing.plans.map((plan, index) => (
              <div
                key={index}
                className={`flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 border overflow-hidden flex flex-col justify-start items-start gap-12 ${
                  plan.featured ? "bg-[#37322F] border-[rgba(55,50,47,0.12)]" : "bg-white border-[#E0DEDB]"
                }`}
              >
                <div className="self-stretch flex flex-col justify-start items-center gap-9">
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div
                      className={`text-lg font-medium leading-7 font-sans ${plan.featured ? "text-[#FBFAF9]" : "text-[rgba(55,50,47,0.90)]"}`}
                    >
                      {plan.name}
                    </div>
                    <div
                      className={`w-full max-w-[242px] text-sm font-normal leading-5 font-sans ${plan.featured ? "text-[#B2AEA9]" : "text-[rgba(41,37,35,0.70)]"}`}
                    >
                      {plan.description}
                    </div>
                  </div>

                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="flex flex-col justify-start items-start gap-1">
                      <div className="relative h-[60px] flex items-center text-5xl font-medium leading-[60px] font-serif">
                        <span className="invisible">${plan.price[billingPeriod]}</span>
                        <span
                          className={`absolute inset-0 flex items-center transition-all duration-500 ${plan.featured ? "text-[#F0EFEE]" : "text-[#37322F]"}`}
                          style={{
                            opacity: billingPeriod === "annually" ? 1 : 0,
                            transform: `scale(${billingPeriod === "annually" ? 1 : 0.8})`,
                            filter: `blur(${billingPeriod === "annually" ? 0 : 4}px)`,
                          }}
                          aria-hidden={billingPeriod !== "annually"}
                        >
                          ${plan.price.annually}
                        </span>
                        <span
                          className={`absolute inset-0 flex items-center transition-all duration-500 ${plan.featured ? "text-[#F0EFEE]" : "text-[#37322F]"}`}
                          style={{
                            opacity: billingPeriod === "monthly" ? 1 : 0,
                            transform: `scale(${billingPeriod === "monthly" ? 1 : 0.8})`,
                            filter: `blur(${billingPeriod === "monthly" ? 0 : 4}px)`,
                          }}
                          aria-hidden={billingPeriod !== "monthly"}
                        >
                          ${plan.price.monthly}
                        </span>
                      </div>
                      <div
                        className={`text-sm font-medium font-sans ${plan.featured ? "text-[#D2C6BF]" : "text-[#847971]"}`}
                      >
                        per {billingPeriod === "monthly" ? "month" : "year"}, per user.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`self-stretch px-4 py-[10px] relative shadow-[0px_2px_4px_rgba(55,50,47,0.12)] overflow-hidden rounded-[99px] flex justify-center items-center ${plan.featured ? "bg-[#FBFAF9]" : "bg-[#37322F]"}`}
                  >
                    <div className="w-full h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0.20)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                    <div
                      className={`max-w-[108px] flex justify-center flex-col text-[13px] font-medium leading-5 font-sans ${plan.featured ? "text-[#37322F]" : "text-[#FBFAF9]"}`}
                    >
                      {plan.cta}
                    </div>
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="self-stretch flex justify-start items-center gap-[13px]">
                      <div className="w-4 h-4 relative flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke={plan.featured ? "#FF8000" : "#9CA3AF"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div
                        className={`flex-1 text-[12.5px] font-normal leading-5 font-sans ${plan.featured ? "text-[#F0EFEE]" : "text-[rgba(55,50,47,0.80)]"}`}
                      >
                        {feature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="w-12 self-stretch relative overflow-hidden hidden md:block">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
