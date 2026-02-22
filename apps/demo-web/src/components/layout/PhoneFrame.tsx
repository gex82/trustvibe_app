import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import StatusBar from "./StatusBar";
import BottomNav from "./BottomNav";

interface Props {
  children: ReactNode;
}

export default function PhoneFrame({ children }: Props) {
  const { currentUser } = useAuth();
  const showNav = !!currentUser;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}
    >
      {/* Background brand watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span
          className="font-extrabold text-white/[0.04] tracking-tight"
          style={{ fontSize: 120 }}
        >
          TrustVibe
        </span>
      </div>

      {/* Phone shell */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: 390,
          height: 844,
          borderRadius: 46,
          background: "#000",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.12), inset 0 0 0 2px #111",
        }}
      >
        {/* Screen inset */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: 6,
            left: 6,
            right: 6,
            bottom: 6,
            borderRadius: 41,
            background: "#f8fafc",
          }}
        >
          {/* Dynamic Island / Notch */}
          <div
            className="absolute top-3 left-1/2 z-50"
            style={{
              transform: "translateX(-50%)",
              width: 126,
              height: 34,
              background: "#000",
              borderRadius: 20,
            }}
          >
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-gray-800"
              style={{ width: 11, height: 11 }}
            />
          </div>

          {/* Status bar */}
          <StatusBar />

          {/* Main content area */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: 44,
              bottom: showNav ? 82 : 0,
              overflow: "hidden",
            }}
          >
            <div className="h-full scroll-area page-enter">{children}</div>
          </div>

          {/* Bottom nav */}
          {showNav && <BottomNav />}
        </div>

        {/* Right side button (power) */}
        <div
          className="absolute right-[-4px]"
          style={{
            top: 168,
            width: 4,
            height: 64,
            background: "#1a1a1a",
            borderRadius: "0 3px 3px 0",
          }}
        />
        {/* Left volume up */}
        <div
          className="absolute left-[-4px]"
          style={{
            top: 110,
            width: 4,
            height: 36,
            background: "#1a1a1a",
            borderRadius: "3px 0 0 3px",
          }}
        />
        {/* Left volume down */}
        <div
          className="absolute left-[-4px]"
          style={{
            top: 158,
            width: 4,
            height: 60,
            background: "#1a1a1a",
            borderRadius: "3px 0 0 3px",
          }}
        />
        {/* Left mute */}
        <div
          className="absolute left-[-4px]"
          style={{
            top: 230,
            width: 4,
            height: 60,
            background: "#1a1a1a",
            borderRadius: "3px 0 0 3px",
          }}
        />
      </div>
    </div>
  );
}
