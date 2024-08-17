<template>
  <svg
    class="fixed z-[1] h-screen w-screen backdrop-blur-3xl"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:svgjs="http://svgjs.dev/svgjs"
    opacity="1"
  >
    <defs>
      <filter
        id="nnnoise-filter"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        filterUnits="objectBoundingBox"
        primitiveUnits="userSpaceOnUse"
        color-interpolation-filters="linearRGB"
      >
        <feTurbulence
          type="fractalNoise"
          numOctaves="9"
          seed="15"
          stitchTiles="stitch"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          result="turbulence"
          :baseFrequency="device.isMobile ? '0.1189' : '0.9189'"
        />
        <feSpecularLighting
          surfaceScale="40"
          specularConstant=".3"
          specularExponent="3"
          lighting-color="hsl(var(--secondary))"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          in="turbulence"
          result="specularLighting"
        >
          <feDistantLight azimuth="4" elevation="100" />
        </feSpecularLighting>
      </filter>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="#ffffff"
      filter="url(#nnnoise-filter)"
      opacity=".5"
    />
  </svg>
  <div
    class="fixed h-[30vh] w-full -translate-y-[20vh] rounded-b-full"
    style="
      background: radial-gradient(
        circle at 50% 0,
        hsl(var(--primary) / 0.4),
        transparent
      );
    "
  />
</template>

<script setup lang="ts">
const device = useDevice();
</script>
