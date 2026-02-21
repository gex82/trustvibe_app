import { useEffect, useState } from "react";

export default function StatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute top-0 left-0 right-0 z-50 flex items-end justify-between px-7 pb-1"
      style={{ height: 44, pointerEvents: "none" }}
    >
      <span className="text-[13px] font-semibold text-gray-900 leading-none">{time}</span>
      <div className="flex items-center gap-[5px]">
        {/* Signal bars */}
        <div className="flex items-end gap-[2px]">
          {[6, 9, 12, 15].map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-sm"
              style={{
                height: h,
                background: i < 3 ? "#1c1c1e" : "#d1d5db",
              }}
            />
          ))}
        </div>
        {/* WiFi icon */}
        <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
          <circle cx="7.5" cy="10" r="1.5" fill="#1c1c1e" />
          <path
            d="M3.8 6.8a5.2 5.2 0 0 1 7.4 0"
            stroke="#1c1c1e"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M1 4a9 9 0 0 1 13 0"
            stroke="#1c1c1e"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-[1px]">
          <div
            className="relative rounded-[2.5px] border border-gray-900"
            style={{ width: 25, height: 12 }}
          >
            <div
              className="absolute rounded-[1.5px] bg-gray-900"
              style={{ inset: 2, right: "25%" }}
            />
          </div>
          <div className="w-[2px] h-[5px] rounded-r-sm bg-gray-900" />
        </div>
      </div>
    </div>
  );
}
