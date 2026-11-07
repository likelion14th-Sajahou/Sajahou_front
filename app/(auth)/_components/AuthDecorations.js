import ShapeCharacter from "@/components/ui/ShapeCharacter";

// 공통 도형의 색상·표정을 재사용하고, 인증 화면별 배치만 관리한다.
const DECORATIONS = [
  { id: "blue-circle", shape: "circle", color: "blue", x: 45.8, y: 45.8, signupY: 79.92, size: 110 },
  { id: "coral-triangle", shape: "triangle", color: "coral", face: "none", x: 250.59, y: 20.19, signupY: 34.81, size: 46, rotate: 12 },
  { id: "green-square", shape: "square", color: "green", x: 184, y: 241.59, signupY: 334.22, size: 64, rotate: -10 },
  { id: "yellow-semicircle", shape: "semicircle", color: "yellow", x: 17.6, y: 377.6, signupY: 518.97, size: 80, rotate: 8 },
  { id: "blue-pentagon", shape: "pentagon", color: "blue", x: 259, y: 475, signupY: 645.62, size: 58, rotate: -6 },
  { id: "yellow-sun", shape: "sunFine", color: "yellow", x: 77.59, y: 552.8, signupY: 757.56, size: 104 },
  { id: "coral-dot-bottom", shape: "circle", color: "coral", face: "none", x: 359.39, y: 633, signupY: 852.38, size: 30 },
  { id: "yellow-dot", shape: "circle", color: "yellow", face: "none", x: 377.8, y: 161.8, signupY: 220.3, size: 22 },
  { id: "green-semicircle", shape: "semicircle", color: "green", x: 1161.59, y: 24, signupY: 48.37, size: 96, rotate: -12 },
  { id: "coral-dot-top", shape: "circle", color: "coral", face: "none", x: 1034.19, y: 26.19, signupY: 40.81, size: 34 },
  { id: "blue-triangle", shape: "triangle", color: "blue", x: 1232.19, y: 209.8, signupY: 292.67, size: 70, rotate: 14 },
  { id: "coral-sun", shape: "sunFine", color: "coral", face: "none", x: 1069.39, y: 306.19, signupY: 418.33, size: 50 },
  { id: "yellow-square", shape: "square", color: "yellow", x: 1282.39, y: 404, signupY: 550.25, size: 56, rotate: 10 },
  { id: "coral-pentagon", shape: "pentagon", color: "coral", x: 1079.19, y: 517.6, signupY: 707.74, size: 88, rotate: 8 },
  { id: "green-dot", shape: "circle", color: "green", face: "none", x: 1276, y: 613.59, signupY: 828.11, size: 40 },
  { id: "yellow-triangle", shape: "triangle", color: "yellow", face: "none", x: 1005.39, y: 645.39, signupY: 869.66, size: 34, rotate: -8 },
];

export default function AuthDecorations({ variant = "login" }) {
  const isSignup = variant === "signup";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {DECORATIONS.map(({ id, shape, color, face = "smile", x, y, signupY, size, rotate = 0 }) => (
        <div
          key={id}
          className="absolute scale-60 sm:scale-80 lg:scale-100"
          style={{ left: `${(x / 1440) * 100}%`, top: `${((isSignup ? signupY : y) / (isSignup ? 963.766 : 720)) * 100}%` }}
        >
          <div style={{ width: size, height: size, transform: `rotate(${rotate}deg)` }}>
            <ShapeCharacter shape={shape} color={color} face={face} size={size} />
          </div>
        </div>
      ))}
    </div>
  );
}
