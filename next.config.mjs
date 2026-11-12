/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 로고·캐릭터·스티커는 선이 또렷한 일러스트라 기본값(75)에서는 가장자리가 뭉개져 보인다.
    // 허용 품질을 90 하나만 두면 next/image가 모든 이미지를 90으로 만든다(목록 밖 값은 가장 가까운 값으로 맞춤).
    // 사진처럼 무거운 이미지가 생기면 [75, 90]으로 늘리고 일러스트에만 quality={90}을 준다.
    qualities: [90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
